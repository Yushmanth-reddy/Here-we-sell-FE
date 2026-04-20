import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateProfile } from '@/lib/api/users';

/**
 * Fetch the current user's full profile.
 */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
}

/**
 * Mutation to update the current user's profile.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bio?: string }) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
