import { useMemo, useState } from "react";
import { Filters, type FiltersState } from "./components/Filters";
import { ScannerTable } from "./components/ScannerTable";
import { ScannerWebSocket } from "./lib/ws";
import { NEW_TOKENS_FILTERS, TRENDING_TOKENS_FILTERS } from "./lib/types";
import { createScannerStore } from "./stores/scannerStore";
import { useStore } from "zustand";
import { useScannerQuery } from "./hooks/useScannerQuery";
import { useScannerUpdates } from "./hooks/useScannerUpdates";

function App() {
  const [filters1, setFilters1] = useState<FiltersState>({ isNotHP: true });
  const [filters2, setFilters2] = useState<FiltersState>({ isNotHP: true });

  const trendingFilters = useMemo(
    () => ({ ...TRENDING_TOKENS_FILTERS, ...filters1 }),
    [filters1]
  );
  const newFilters = useMemo(
    () => ({ ...NEW_TOKENS_FILTERS, ...filters2 }),
    [filters2]
  );

  const [realtimeTrending, setRealtimeTrending] = useState(true);
  const [realtimeNew, setRealtimeNew] = useState(true);
  const wsTrending = useMemo(() => new ScannerWebSocket(), []);
  const wsNew = useMemo(() => new ScannerWebSocket(), []);
  const trendingStore = useMemo(
    () => createScannerStore(wsTrending, {}),
    [wsTrending]
  );
  const newStore = useMemo(() => createScannerStore(wsNew, {}), [wsNew]);

  const trendingQuery = useScannerQuery(trendingStore, trendingFilters);
  const newQuery = useScannerQuery(newStore, newFilters);
  useScannerUpdates(trendingStore, trendingFilters, realtimeTrending);
  useScannerUpdates(newStore, newFilters, realtimeNew);

  const trendingRows = useStore(trendingStore, (s) => s.rows);
  const newRows = useStore(newStore, (s) => s.rows);

  const trendingSubs = useScannerUpdates(
    trendingStore,
    trendingFilters,
    realtimeTrending
  );
  const newSubs = useScannerUpdates(newStore, newFilters, realtimeNew);

  return (
    <div className="h-screen w-screen bg-neutral-950 flex p-4">
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="space-y-2 flex flex-col h-full items-stretch">
          <Filters
            value={filters1}
            onChange={setFilters1}
            realtime={realtimeTrending}
            onChangeRealtime={setRealtimeTrending}
          />
          <ScannerTable
            title="Trending Tokens"
            rows={trendingRows}
            isLoading={trendingQuery.isLoading}
            isError={trendingQuery.isError}
            onEndReached={() => trendingQuery.loadMore()}
            isFetchingMore={trendingQuery.isFetchingMore}
            onRowMount={trendingSubs.onRowMount}
            onRowUnmount={trendingSubs.onRowUnmount}
          />
        </div>
        <div className="space-y-2 flex flex-col h-full items-stretch">
          <Filters
            value={filters2}
            onChange={setFilters2}
            realtime={realtimeNew}
            onChangeRealtime={setRealtimeNew}
          />
          <ScannerTable
            title="New Tokens"
            rows={newRows}
            isLoading={newQuery.isLoading}
            isError={newQuery.isError}
            onEndReached={() => newQuery.loadMore()}
            isFetchingMore={newQuery.isFetchingMore}
            onRowMount={newSubs.onRowMount}
            onRowUnmount={newSubs.onRowUnmount}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
