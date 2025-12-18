import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/authApi';

export const currentUserQueryKey = ['current-user'];

const useCurrentUser = () => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (err) {
        // Treat unauthenticated as "no user" instead of blowing up the UI
        if (err?.response?.status === 401) return null;
        throw err;
      }
    },
    // With session auth, user can change at any time; keep cache but allow invalidation/refetch
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, err) => {
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  return {
    user: data,
    isLoading,
    isFetching,
    error,
    refetch,
    isAuthenticated: !!data,
  };
};

export default useCurrentUser;


