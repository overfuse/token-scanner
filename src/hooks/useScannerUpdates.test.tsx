import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createScannerStore } from "../stores/scannerStore";
import { useScannerUpdates } from "./useScannerUpdates";
import type { ScannerResult } from "../lib/types";

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

describe("useScannerUpdates", () => {
  it("subscribes/unsubscribes on row mount/unmount", () => {
    const ws: any = new MockWS();
    const store = createScannerStore(ws, {});
    // seed store with one row
    const r = makeResult({ pairAddress: "A", token1Address: "ta" });
    store.getState().onScannerPairs([r]);

    const { result } = renderHook(() =>
      useScannerUpdates(store, { orderBy: "desc" } as any, true)
    );

    act(() => result.current.onRowMount("A-ta"));
    expect(ws.subscribePair).toHaveBeenCalledTimes(1);
    expect(ws.subscribePairStats).toHaveBeenCalledTimes(1);

    act(() => result.current.onRowUnmount("A-ta"));
    expect(ws.unsubscribePair).toHaveBeenCalledTimes(1);
    expect(ws.unsubscribePairStats).toHaveBeenCalledTimes(1);
  });
});
