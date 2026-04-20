import { apiClient } from './client';
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';

/**
 * Get the currently authenticated user's profile.
 */
export async function getMe(): Promise<ApiResponse<User>> {
  return apiClient.get('/users/me');
}

/**
 * Update the current user's profile (bio, etc.).
 */
export async function updateProfile(
  data: { bio?: string }
): Promise<ApiResponse<User>> {
  return apiClient.patch('/users/me', data);
}
