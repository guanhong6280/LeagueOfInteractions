import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import { currentUserQueryKey } from './useCurrentUser';

const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => logout(),
    onSuccess: () => {
      // Clear session user immediately
      queryClient.setQueryData(currentUserQueryKey, null);
      // Also drop any cached user/profile data that may be user-specific
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      // Match prior behavior: return user to home
      window.location.href = '/';
    },
  });
};

export default useLogout;


