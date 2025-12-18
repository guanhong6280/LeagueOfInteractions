import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserInformation } from '../api/userApi';
import { queryKeys } from './useUserProfile';
import useCurrentUser, { currentUserQueryKey } from './useCurrentUser';

const useAccountManagement = () => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const username = user?.username;

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const response = await updateUserInformation(payload);
      return response;
    },
    onSuccess: async (data) => {
      const updatedUser = data?.user;
      if (updatedUser) {
        // Single source of truth: update the React Query "current user" cache
        queryClient.setQueryData(currentUserQueryKey, updatedUser);
      }

      // Update the React Query cache immediately so navigation shows fresh data
      if (updatedUser?.username) {
        queryClient.setQueryData(
          { queryKey: queryKeys.userProfile(updatedUser.username) },
          { success: true, user: updatedUser }
        );
      }
      
      // Invalidate and refetch all user profile queries
      if (username) {
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.userProfile(username),
          refetchType: 'active' // Only refetch active queries
        });
      }
      
      // Also invalidate any queries that might match the user profile pattern
      // This handles cases where username might have changed
      await queryClient.invalidateQueries({ 
        queryKey: ['user-profile'],
        refetchType: 'active'
      });
    },
  });

  return mutation;
};

export default useAccountManagement;

