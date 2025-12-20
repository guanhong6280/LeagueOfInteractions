import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/authApi';

// Export key for invalidation elsewhere (e.g., inside useLogin/useLogout)
export const currentUserQueryKey = ['current-user'];

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

const useCurrentUser = () => {

  const {
    data: user,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      try {
        const result = await getCurrentUser(); 
        return result;
      } catch (err) {
        if (err?.response?.status === 401) return null;
        throw err;
      }
    },
    refetchOnWindowFocus: true, 
    staleTime: DEFAULT_STALE_TIME,
    retry: (failureCount, err) => {
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  // 4. DERIVED STATE (The "Google Standard" Developer Experience)
  // Instead of making every component check `user && user.role === 'admin'`,
  // we calculate these standard flags centrally here.
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdministrator || false; // Based on your previous schema

  return {
    // Data
    user: user || null, // Ensure explicit null if undefined
    
    // State Flags
    isLoading,   // True only on initial hard load
    isFetching,  // True on background refetches
    isAuthenticated,
    isAdmin,     // <--- New helper
    
    // Actions
    refetch,
    
    // Meta
    error,
  };
};

export default useCurrentUser;
