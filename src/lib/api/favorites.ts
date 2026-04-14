import { apiClient } from './client';
import type { Listing } from '@/types/listing';

/**
 * Toggle favorite on a listing. Backend adds if not favorited, removes if already favorited.
 */
export async function toggleFavorite(listingId: string): Promise<unknown> {
  return apiClient.post(`/listings/${listingId}/favorite`);
}

/**
 * Get all favorited listings for the currently logged-in user.
 */
export async function getMyFavorites(): Promise<{ data: Listing[] }> {
  return apiClient.get('/users/me/favorites');
}
