import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import { currentUserQueryKey } from './useCurrentUser';
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => logout(),
    onSuccess: () => {
      // Clear session user immediately
      queryClient.setQueryData(currentUserQueryKey, null);
      // Also drop any cached user/profile data that may be user-specific
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      // Match prior behavior: return user to home
      navigate('/');
    },
  });
};

export default useLogout;


