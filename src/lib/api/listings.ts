import { apiClient } from './client';
import type { Listing } from '@/types/listing';
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
  // Strip out undefined params so they don't appear as ?key=undefined
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
