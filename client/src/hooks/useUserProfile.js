import { useQuery } from '@tanstack/react-query';
import { getUserProfileByUsername, getSkinsByIds } from '../api/userApi';
import useCurrentUser from './useCurrentUser';

// Query key factory for centralized key management
export const queryKeys = {
  userProfile: (username) => ['user-profile', username],
  favoriteSkins: (skinIds) => ['favorite-skins', skinIds?.join(',')],
};

/**
 * Custom hook for fetching user profile data
 * @param {string} username - Username to fetch (optional, defaults to current user)
 * @returns {Object} Profile data, loading states, and helper flags
 */
const useUserProfile = (username = null) => {
  const { user: currentUser } = useCurrentUser();
  
  // Determine target and ownership
  const isOwnProfile = currentUser && (!username || username === currentUser.username);
  const targetUsername = username || currentUser?.username;

  // Query 1: Fetch user profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: queryKeys.userProfile(targetUsername),
    queryFn: async () => {
      // Always fetch from API to ensure fresh data and proper cache invalidation
      return await getUserProfileByUsername(targetUsername);
    },
    enabled: !!targetUsername, // Only run when we have a username
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry failed requests
  });

  const profileUser = profileData?.user;

  // Query 2: Fetch favorite skins (dependent on profile data)
  const {
    data: skinsData,
    isLoading: isSkinsLoading,
    error: skinsError,
    refetch: refetchSkins,
  } = useQuery({
    queryKey: queryKeys.favoriteSkins(profileUser?.favoriteSkins),
    queryFn: () => getSkinsByIds(profileUser.favoriteSkins),
    enabled: !!(profileUser?.favoriteSkins?.length), // Only fetch if user has favorite skins
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (skins change less frequently)
    retry: 2,
  });

  const favoriteSkins = skinsData?.data || [];

  // Combined loading state
  const isLoading = isProfileLoading || (profileUser?.favoriteSkins?.length && isSkinsLoading);
  
  // Combined error
  const error = profileError || skinsError;

  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([refetchProfile(), refetchSkins()]);
  };

  return {
    // Data
    profileUser,
    favoriteSkins,
    
    // Loading states
    isLoading,
    isProfileLoading,
    isSkinsLoading,
    
    // Error states
    error,
    profileError,
    skinsError,
    
    // Helper flags
    isOwnProfile,
    targetUsername,
    
    // Refetch functions
    refetchProfile,
    refetchSkins,
    refetchAll,
  };
};

export default useUserProfile;

