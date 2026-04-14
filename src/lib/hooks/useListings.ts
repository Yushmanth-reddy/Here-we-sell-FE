import { useInfiniteQuery } from '@tanstack/react-query';
import { getListings, type ListingsQueryParams } from '@/lib/api/listings';

/**
 * Hook for fetching paginated listings with infinite scroll support.
 * Uses TanStack Query's useInfiniteQuery for cursor-based pagination.
 */
export function useListings(params: Omit<ListingsQueryParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', params],
    queryFn: async ({ pageParam }) => {
      const response = await getListings({
        ...params,
        cursor: pageParam as string | undefined,
      });
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_more) {
        return lastPage.pagination.next_cursor ?? undefined;
      }
      return undefined;
    },
  });
}
