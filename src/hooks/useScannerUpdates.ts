import { useCallback, useEffect } from "react";
import type { GetScannerResultParams } from "../lib/types";
import { chainIdToName } from "../lib/types";
import type { ScannerStore } from "../stores/scannerStore";

export function useScannerUpdates(
  store: ScannerStore,
  filter: GetScannerResultParams,
  realtimeEnabled: boolean
) {
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

  const onRowMount = useCallback(
    (id: string) => {
      if (!realtimeEnabled) return;
      const st = store.getState();
      const r = st.rowsById.get(id);
      if (!r) return;
      st.ws.subscribePairStats({
        pair: r.pairAddress,
        token: r.tokenAddress,
        chain: chainIdToName(r.chainId),
      });
      st.ws.subscribePair({
        pair: r.pairAddress,
        token: r.tokenAddress,
        chain: chainIdToName(r.chainId),
      });
    },
    [realtimeEnabled, store]
  );

  const onRowUnmount = useCallback(
    (id: string) => {
      const st = store.getState();
      const r = st.rowsById.get(id);
      if (!r) return;
      st.ws.unsubscribePairStats({
        pair: r.pairAddress,
        token: r.tokenAddress,
        chain: chainIdToName(r.chainId),
      });
      st.ws.unsubscribePair({
        pair: r.pairAddress,
        token: r.tokenAddress,
        chain: chainIdToName(r.chainId),
      });
    },
    [store]
  );

  return { onRowMount, onRowUnmount };
}
