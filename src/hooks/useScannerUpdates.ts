import { useEffect, useRef } from "react";
import type { GetScannerResultParams } from "../lib/types";
import { chainIdToName } from "../lib/types";
import type { ScannerStore } from "../stores/scannerStore";

export function useScannerUpdates(
  store: ScannerStore,
  filter: GetScannerResultParams,
  realtimeEnabled: boolean
) {
  const subscribedRef = useRef<Set<string>>(new Set());
  const ws = store.getState().ws;

  useEffect(() => {
    if (!realtimeEnabled) {
      ws.unsubscribeScanner(filter);
      return;
    }
    ws.connect();
    ws.subscribeScanner(filter);
    const off = ws.on((msg) => {
      if (msg.event === "tick") store.getState().onTick(msg.data);
      if (msg.event === "pair-stats") store.getState().onPairStats(msg.data);
      if (msg.event === "scanner-pairs") {
        store.getState().onScannerPairs(msg.data.results.pairs);
      }
    });
    return () => {
      off();
      ws.unsubscribeScanner(filter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter), realtimeEnabled, ws]);

  useEffect(() => {
    if (!realtimeEnabled) {
      for (const id of Array.from(subscribedRef.current))
        subscribedRef.current.delete(id);
      return;
    }
    const rows = store.getState().rows;
    const desired = new Set(rows.map((r) => r.id));
    const current = subscribedRef.current;

    for (const id of Array.from(current)) {
      if (!desired.has(id)) {
        const r = store.getState().rowsById.get(id);
        if (r) {
          ws.unsubscribePairStats({
            pair: r.pairAddress,
            token: r.tokenAddress,
            chain: chainIdToName(r.chainId),
          });
          ws.unsubscribePair({
            pair: r.pairAddress,
            token: r.tokenAddress,
            chain: chainIdToName(r.chainId),
          });
        }
        current.delete(id);
      }
    }

    for (const r of rows) {
      if (!current.has(r.id)) {
        ws.subscribePairStats({
          pair: r.pairAddress,
          token: r.tokenAddress,
          chain: chainIdToName(r.chainId),
        });
        ws.subscribePair({
          pair: r.pairAddress,
          token: r.tokenAddress,
          chain: chainIdToName(r.chainId),
        });
        current.add(r.id);
      }
    }

    return () => {
      for (const id of Array.from(subscribedRef.current)) {
        const r = store.getState().rowsById.get(id);
        if (r) {
          ws.unsubscribePairStats({
            pair: r.pairAddress,
            token: r.tokenAddress,
            chain: chainIdToName(r.chainId),
          });
          ws.unsubscribePair({
            pair: r.pairAddress,
            token: r.tokenAddress,
            chain: chainIdToName(r.chainId),
          });
        }
      }
      subscribedRef.current.clear();
    };
  }, [store, realtimeEnabled, ws]);
}
