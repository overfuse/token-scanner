import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchScanner } from "../lib/api";
import type { GetScannerResultParams, ScannerApiResponse } from "../lib/types";
import type { ScannerStore } from "../stores/scannerStore";

export function useScannerQuery(
  store: ScannerStore,
  filter: GetScannerResultParams
) {
  const query = useInfiniteQuery<ScannerApiResponse, Error>({
    queryKey: ["scanner", { ...filter, page: undefined }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const resp = await fetchScanner({ ...filter, page: pageParam as number });
      return resp;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.pairs.length, 0);
      if (loaded < lastPage.totalRows && lastPage.pairs.length > 0) {
        return allPages.length + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const pages = query.data?.pages ?? [];
    // Push all pages into the store as a flat list incrementally
    const flat = pages.flatMap((p) => p.pairs);
    if (flat.length > 0) {
      store.getState().onScannerPairs(flat);
    } else {
      // when filter changes and no data yet, clear rows
      store.getState().resetRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    loadMore: () => query.fetchNextPage(),
    hasMore: Boolean(query.hasNextPage),
    isFetchingMore: query.isFetchingNextPage,
  };
}
