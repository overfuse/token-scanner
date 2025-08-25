import { describe, it, expect, vi, beforeEach } from "vitest";
import { createScannerStore } from "./scannerStore";
import type {
  ScannerResult,
  PairStatsMsgData,
  TickEventPayload,
} from "../lib/types";

class MockWS {
  subscribePairStats = vi.fn();
  unsubscribePairStats = vi.fn();
  subscribePair = vi.fn();
  unsubscribePair = vi.fn();
  connect = vi.fn();
  on = vi.fn().mockReturnValue(() => {});
  subscribeScanner = vi.fn();
  unsubscribeScanner = vi.fn();
}

function makeResult(overrides: Partial<ScannerResult> = {}): ScannerResult {
  return {
    age: new Date().toISOString(),
    bundlerHoldings: "0",
    buyFee: null,
    buys: 0,
    callCount: 0,
    chainId: 1,
    contractRenounced: false,
    contractVerified: false,
    currentMcap: "100",
    devHoldings: "0",
    dexPaid: false,
    diff1H: "0",
    diff24H: "0",
    diff5M: "0",
    diff6H: "0",
    fdv: "0",
    first1H: "0",
    first24H: "0",
    first5M: "0",
    first6H: "0",
    initialMcap: "100",
    insiderHoldings: "0",
    insiders: 0,
    isFreezeAuthDisabled: false,
    isMintAuthDisabled: false,
    liquidity: "0",
    liquidityLocked: false,
    liquidityLockedAmount: "0",
    liquidityLockedRatio: "0",
    makers: 0,
    migratedFromVirtualRouter: null,
    virtualRouterType: null,
    migratedFromPairAddress: null,
    migratedFromRouterAddress: null,
    migrationProgress: null,
    pairAddress: "0xpair",
    pairMcapUsd: "100",
    pairMcapUsdInitial: "100",
    percentChangeInLiquidity: "0",
    percentChangeInMcap: "0",
    price: "1",
    reserves0: "0",
    reserves0Usd: "0",
    reserves1: "0",
    reserves1Usd: "0",
    routerAddress: "0xrouter",
    sellFee: null,
    sells: 0,
    sniperHoldings: "0",
    snipers: 0,
    telegramLink: null,
    token0Decimals: 9,
    token0Symbol: "BASE",
    token1Address: "0xtoken",
    token1Decimals: "9",
    token1ImageUri: null,
    token1Name: "Token",
    token1Symbol: "TKN",
    token1TotalSupplyFormatted: "100",
    top10Holdings: "0",
    twitterLink: null,
    txns: 0,
    volume: "200",
    webLink: null,
    ...overrides,
  };
}

describe("scannerStore", () => {
  let ws: any;
  beforeEach(() => {
    ws = new MockWS();
    vi.useFakeTimers();
  });

  it("merges scanner pairs and computes rows", () => {
    const store = createScannerStore(ws, {});
    const a = makeResult({
      pairAddress: "A",
      token1Address: "ta",
      volume: "10",
      price: "2",
    });
    const b = makeResult({
      pairAddress: "B",
      token1Address: "tb",
      volume: "20",
      price: "3",
    });
    store.getState().onScannerPairs([a, b]);
    vi.runAllTimers();
    const rows = store.getState().rows;
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe("A-ta");
    expect(rows[1].id).toBe("B-tb");
  });

  it("updates price and mcap on tick", () => {
    const store = createScannerStore(ws, {});
    const a = makeResult({
      pairAddress: "A",
      token1Address: "ta",
      token1TotalSupplyFormatted: "100",
      price: "1",
    });
    store.getState().onScannerPairs([a]);
    vi.runAllTimers();
    const tick: TickEventPayload = {
      pair: { pair: "A", token: "ta", chain: "ETH" },
      swaps: [
        {
          timestamp: new Date().toISOString(),
          addressTo: "",
          addressFrom: "",
          token0Address: "",
          amountToken0: "0",
          amountToken1: "0",
          priceToken0Usd: "0",
          priceToken1Usd: "2",
          tokenInAddress: "",
          isOutlier: false,
        },
      ],
    };
    store.getState().onTick(tick);
    vi.runAllTimers();
    const row = store.getState().rows[0];
    expect(row.priceUsd).toBe(2);
    expect(row.mcap).toBe(200);
  });

  it("applies pair-stats to audit fields", () => {
    const store = createScannerStore(ws, {});
    const a = makeResult({ pairAddress: "A", token1Address: "ta" });
    store.getState().onScannerPairs([a]);
    const tf = {
      buyVolume: "0",
      buyers: 0,
      buys: 0,
      change: "0",
      diff: "0",
      first: "0",
      last: "0",
      makers: 0,
      sellVolume: "0",
      sellers: 0,
      sells: 0,
      txns: 0,
      volume: "0",
    } as const;

    const stats: PairStatsMsgData = {
      pair: {
        token1SniperWalletToTotalSupplyRatio: "0",
        token1BundlerWalletToTotalSupplyRatio: "0",
        traders: 0,
        bundlers: 0,
        burnedSupply: "0",
        chain: "ETH",
        dexPaid: true,
        fdv: "0",
        freezeAuthorityRenounced: true,
        insiderHoldings: "0",
        insiders: 0,
        isMigrating: null,
        isVerified: true,
        linkDiscord: null,
        linkTelegram: null,
        linkTwitter: null,
        linkWebsite: null,
        lockedAmount: undefined,
        migratedFromPairAddress: null,
        migratedFromRouterAddress: null,
        migratedToPairAddress: null,
        migratedFromVirtualRouter: null,
        virtualRouterType: null,
        mintAuthorityRenounced: true,
        pairAddress: "A",
        pairCreatedAt: new Date().toISOString(),
        pairMarketcapUsd: "0",
        pairPrice0Usd: "0",
        pairPrice1Usd: "0",
        pairReserves0: "0",
        pairReserves0Usd: "0",
        pairReserves1: "0",
        pairReserves1Usd: "0",
        pairTotalSupply: "0",
        renounced: true,
        routerAddress: "0xrouter",
        routerType: "",
        sniperHoldings: "0",
        snipers: 0,
        token0Address: "",
        token0Decimals: 9,
        token0Symbol: "",
        token1Address: "ta",
        token1BuyFee: null,
        token1Decimals: 9,
        token1DevWalletToTotalSupplyRatio: undefined,
        token1ImageUri: null,
        token1IsHoneypot: false,
        token1IsProxy: false,
        token1MaxTransaction: undefined,
        token1MaxTransactionToTotalSupplyRatio: undefined,
        token1MaxWallet: undefined,
        token1MaxWalletToTotalSupplyRatio: undefined,
        token1Name: "",
        token1SellFee: null,
        token1Symbol: "",
        token1TotalSupply: "0",
        token1TotalSupplyFormatted: "0",
        token1TransferFee: null,
        top10Holdings: null,
        totalLockedRatio: "0",
      },
      pairStats: {
        fiveMin: tf as any,
        oneHour: tf as any,
        sixHour: tf as any,
        twentyFourHour: tf as any,
      } as any,
      migrationProgress: "10",
      callCount: 1,
    } as any;
    store.getState().onPairStats(stats);
    vi.runAllTimers();
    const row = store.getState().rows[0];
    expect(row.audit.contractVerified).toBe(true);
    expect(row.audit.mintable).toBe(true);
    expect(row.audit.freezable).toBe(true);
    expect(row.audit.honeypot).toBe(true); // !false
  });
});
