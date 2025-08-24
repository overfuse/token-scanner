import { createStore, type StoreApi } from "zustand/vanilla";
import type {
  PairStatsMsgData,
  ScannerResult,
  TickEventPayload,
  OrderBy,
  SerdeRankBy,
} from "../lib/types";
import { ScannerWebSocket } from "../lib/ws";

export interface NormalizedTokenRow {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenBaseSymbol?: string;
  tokenAddress: string;
  pairAddress: string;
  chain: string;
  chainId: number;
  exchange: string;
  priceUsd: number;
  priceFlash?: "up" | "down" | null;
  priceFlashAt?: number;
  totalSupply?: number;
  volumeUsd: number;
  mcap: number;
  mcapChangePc?: number;
  priceChangePcs: { "5m": number; "1h": number; "6h": number; "24h": number };
  transactions: { buys: number; sells: number };
  audit: {
    mintable: boolean;
    freezable: boolean;
    honeypot: boolean;
    contractVerified: boolean;
    renounced: boolean;
    liquidityLocked: boolean;
    linkDiscord?: string | null;
    linkTelegram?: string | null;
    linkTwitter?: string | null;
    linkWebsite?: string | null;
    dexPaid?: boolean;
  };
  migrationPc?: number;
  tokenCreatedTimestamp: Date;
  liquidity: { current: number; changePc: number };
}

export interface FiltersState {
  chain?: "ETH" | "SOL" | "BASE" | "BSC" | null;
  minVol24H?: number | null;
  maxAge?: number | null;
  minMcap?: number | null;
  isNotHP?: boolean | null;
}

function computeMcap(sr: ScannerResult): number {
  const order = [
    sr.currentMcap,
    sr.initialMcap,
    sr.pairMcapUsd,
    sr.pairMcapUsdInitial,
  ];
  for (const v of order) {
    const num = Number(v);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return 0;
}

function normalize(sr: ScannerResult): NormalizedTokenRow {
  const id = `${sr.pairAddress}-${sr.token1Address}`;
  return {
    id,
    tokenName: sr.token1Name,
    tokenSymbol: sr.token1Symbol,
    tokenBaseSymbol: sr.token0Symbol,
    tokenAddress: sr.token1Address,
    pairAddress: sr.pairAddress,
    chain: String(sr.chainId),
    chainId: sr.chainId,
    exchange: sr.routerAddress,
    priceUsd: Number(sr.price) || 0,
    totalSupply: sr.token1TotalSupplyFormatted
      ? Number(sr.token1TotalSupplyFormatted)
      : undefined,
    volumeUsd: Number(sr.volume) || 0,
    mcap: computeMcap(sr),
    mcapChangePc: Number(sr.percentChangeInMcap) || 0,
    priceChangePcs: {
      "5m": Number(sr.diff5M) || 0,
      "1h": Number(sr.diff1H) || 0,
      "6h": Number(sr.diff6H) || 0,
      "24h": Number(sr.diff24H) || 0,
    },
    transactions: { buys: sr.buys ?? 0, sells: sr.sells ?? 0 },
    audit: {
      mintable: sr.isMintAuthDisabled,
      freezable: sr.isFreezeAuthDisabled,
      honeypot: Boolean(sr.honeyPot === true),
      contractVerified: sr.contractVerified,
      renounced: sr.contractRenounced,
      liquidityLocked: sr.liquidityLocked,
      linkDiscord: sr.discordLink ?? null,
      linkTelegram: sr.telegramLink ?? null,
      linkTwitter: sr.twitterLink ?? null,
      linkWebsite: sr.webLink ?? null,
      dexPaid: sr.dexPaid,
    },
    migrationPc: sr.migrationProgress
      ? Number(sr.migrationProgress)
      : undefined,
    tokenCreatedTimestamp: new Date(sr.age),
    liquidity: {
      current: Number(sr.liquidity) || 0,
      changePc: Number(sr.percentChangeInLiquidity) || 0,
    },
  };
}

type SortState = { rankBy?: SerdeRankBy; orderBy?: OrderBy };

export interface ScannerStoreState {
  ws: ScannerWebSocket;
  filters: FiltersState;
  rowsById: Map<string, NormalizedTokenRow>;
  rows: NormalizedTokenRow[];
  subscribedIds: Set<string>;
  realtimeEnabled: boolean;
  sort: SortState;
  // actions
  setFilters: (partial: Partial<FiltersState>) => void;
  setRealtime: (on: boolean) => void;
  setSort: (s: SortState) => void;
  resetRows: () => void;
  onScannerPairs: (pairs: ScannerResult[]) => void;
  onTick: (payload: TickEventPayload) => void;
  onPairStats: (payload: PairStatsMsgData) => void;
  flush: () => void;
}

export type ScannerStore = StoreApi<ScannerStoreState>;

export function createScannerStore(
  ws: ScannerWebSocket,
  initialFilters: FiltersState = {}
): ScannerStore {
  let debounceTimer: number | null = null;
  let pending = false;

  const store = createStore<ScannerStoreState>((set, get) => ({
    ws,
    filters: initialFilters,
    rowsById: new Map<string, NormalizedTokenRow>(),
    rows: [],
    subscribedIds: new Set<string>(),
    realtimeEnabled: true,
    sort: {},
    setFilters: (partial) => set({ filters: { ...get().filters, ...partial } }),
    setRealtime: (on) => set({ realtimeEnabled: on }),
    setSort: (s) => set({ sort: { ...get().sort, ...s } }),
    resetRows: () =>
      set({
        rowsById: new Map<string, NormalizedTokenRow>(),
        rows: [],
        subscribedIds: new Set<string>(),
      }),
    onScannerPairs: (pairs) => {
      const map = get().rowsById;
      for (const sr of pairs) {
        const n = normalize(sr);
        const prev = map.get(n.id);
        if (!prev) {
          map.set(n.id, n);
        } else {
          map.set(n.id, {
            ...n,
            priceUsd: prev.priceUsd,
            mcap: prev.mcap,
            audit: prev.audit,
          });
        }
      }
      get().flush();
    },
    onTick: (payload) => {
      const id = `${payload.pair.pair}-${payload.pair.token}`;
      const latest = payload.swaps.filter((s) => !s.isOutlier).pop();
      if (!latest) return;
      const map = get().rowsById;
      const r = map.get(id);
      if (!r) return;
      const newPrice = Number(latest.priceToken1Usd);
      const dir: "up" | "down" | null =
        newPrice > r.priceUsd ? "up" : newPrice < r.priceUsd ? "down" : null;
      const newMcap =
        typeof r.totalSupply === "number" ? r.totalSupply * newPrice : r.mcap;
      map.set(id, {
        ...r,
        priceUsd: newPrice,
        mcap: newMcap,
        priceFlash: dir,
        priceFlashAt: Date.now(),
      });
      get().flush();
    },
    onPairStats: (data) => {
      const map = get().rowsById;
      let changed = false;
      map.forEach((r, id) => {
        if (r.pairAddress !== data.pair.pairAddress) return;
        map.set(id, {
          ...r,
          audit: {
            mintable: data.pair.mintAuthorityRenounced,
            freezable: data.pair.freezeAuthorityRenounced,
            honeypot: !data.pair.token1IsHoneypot,
            contractVerified: data.pair.isVerified,
            renounced: r.audit.renounced,
            liquidityLocked:
              typeof data.pair.totalLockedRatio !== "undefined"
                ? Boolean(Number(data.pair.totalLockedRatio) > 0)
                : r.audit.liquidityLocked,
            linkDiscord: data.pair.linkDiscord ?? r.audit.linkDiscord ?? null,
            linkTelegram:
              data.pair.linkTelegram ?? r.audit.linkTelegram ?? null,
            linkTwitter: data.pair.linkTwitter ?? r.audit.linkTwitter ?? null,
            linkWebsite: data.pair.linkWebsite ?? r.audit.linkWebsite ?? null,
            dexPaid:
              typeof data.pair.dexPaid === "boolean"
                ? data.pair.dexPaid
                : r.audit.dexPaid,
          },
          migrationPc: data.migrationProgress
            ? Number(data.migrationProgress)
            : r.migrationPc,
        });
        changed = true;
      });
      if (changed) get().flush();
    },
    flush: () => {
      pending = true;
      if (debounceTimer !== null) return;
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        if (!pending) return;
        const { rowsById, sort } = store.getState();
        const arr = Array.from(rowsById.values());
        const { rankBy, orderBy } = sort;
        const getVal = (r: NormalizedTokenRow): number => {
          switch (rankBy) {
            case "volume":
              return r.volumeUsd;
            case "age":
              return r.tokenCreatedTimestamp.getTime();
            case "liquidity":
              return r.liquidity.current;
            case "mcap":
              return r.mcap;
            default:
              return 0;
          }
        };
        if (rankBy) {
          arr.sort((a, b) => {
            const va = getVal(a);
            const vb = getVal(b);
            if (va === vb) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
            return (orderBy ?? "desc") === "asc" ? va - vb : vb - va;
          });
        }
        store.setState({ rows: arr });
        pending = false;
      }, 100);
    },
  }));

  return store;
}
