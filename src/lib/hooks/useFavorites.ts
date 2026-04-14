import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite, getMyFavorites } from '@/lib/api/favorites';

/**
 * Fetch the current user's favorited listings.
 */
export function useMyFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getMyFavorites,
  });
}

/**
 * Toggle favorite on a listing with optimistic cache invalidation.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => toggleFavorite(listingId),
    onSuccess: () => {
      // Invalidate both the favorites list and listings cache so heart icons update
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
