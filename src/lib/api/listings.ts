import { apiClient } from './client';
import type { Listing, CreateListingInput } from '@/types/listing';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface ListingsQueryParams {
  q?: string;
  category?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Fetch paginated listings with optional search/filter/sort.
 * The apiClient response interceptor already unwraps `response.data`,
 * so we receive the backend JSON directly.
 */
export async function getListings(
  params: ListingsQueryParams = {}
): Promise<PaginatedResponse<Listing>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  );

  return apiClient.get('/listings', { params: cleanParams });
}

/**
 * Fetch a single listing by its ID.
 */
export async function getListingById(
  id: string
): Promise<ApiResponse<Listing>> {
  return apiClient.get(`/listings/${id}`);
}

/**
 * Create a new listing.
 */
export async function createListing(
  data: CreateListingInput
): Promise<ApiResponse<Listing>> {
  return apiClient.post('/listings', data);
}

/**
 * Update an existing listing (owner only).
 */
export async function updateListing(
  id: string,
  data: Partial<CreateListingInput>
): Promise<ApiResponse<Listing>> {
  return apiClient.patch(`/listings/${id}`, data);
}

/**
 * Soft delete a listing (owner or admin).
 */
export async function deleteListing(
  id: string
): Promise<ApiResponse<null>> {
  return apiClient.delete(`/listings/${id}`);
}

/**
 * Get all listings created by the logged-in user.
 */
export async function getMyListings(): Promise<ApiResponse<Listing[]>> {
  return apiClient.get('/users/me/listings');
}
