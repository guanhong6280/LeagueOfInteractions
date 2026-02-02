import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submitSkinRating, getUserSkinRating } from '../../../api/championApi';
import { toastMessages, useToast } from '../../../toast/useToast';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { queryKeys as ratingSectionQueryKeys } from '../../../hooks/useRatingSectionData';

const queryKeys = {
  userRating: (skinId, userId) => ['user-skin-rating', skinId, userId],
  /** Key used by useSkinData (carousel) so community averages refetch. */
  championSkins: (championName) => ['champion-skins', championName],
};

const useSkinRatingData = (currentSkinId, options = {}) => {
  const { championId, championName } = options;
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();

  // Local Form State
  const [splashArtRating, setSplashArtRating] = useState(0);
  const [inGameModelRating, setInGameModelRating] = useState(0);

  // 1. QUERY: Fetch existing user rating
  const { 
    data: existingRating, 
    isLoading 
  } = useQuery({
    queryKey: queryKeys.userRating(currentSkinId, user?.id),
    queryFn: async () => {
      const response = await getUserSkinRating(currentSkinId);
      return response.success ? response.data : null;
    },
    // Only run if we have a user and a skin ID
    enabled: !!currentSkinId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. EFFECT: Sync fetched data to form state
  // This ensures the stars light up if the user has already rated this skin
  useEffect(() => {
    if (existingRating) {
      setSplashArtRating(existingRating.splashArtRating || 0);
      setInGameModelRating(existingRating.inGameModelRating || 0);
    } else {
      // Reset form if no rating found (or user logged out/changed skin)
      setSplashArtRating(0);
      setInGameModelRating(0);
    }
  }, [existingRating, currentSkinId]);

  // 3. MUTATION: Submit Rating
  const mutation = useMutation({
    mutationFn: (payload) => submitSkinRating(currentSkinId, payload),
    
    onSuccess: (response) => {
      if (response.success) {
        success(toastMessages.rating.skin.success);

        // Invalidate user rating so form reflects saved state
        queryClient.invalidateQueries({
          queryKey: queryKeys.userRating(currentSkinId, user?.id),
        });

        // Invalidate champion stats (page-level stats and skin highlights)
        if (championId) {
          queryClient.invalidateQueries({
            queryKey: ratingSectionQueryKeys.championStatsPrefix(championId),
          });
        }

        // Invalidate skin list so carousel/currentSkin get updated community averages
        if (championName) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.championSkins(championName),
          });
        }
      } else {
        error(response.error || toastMessages.rating.skin.error);
      }
    },
    onError: () => {
      error(toastMessages.rating.skin.error);
    }
  });

  // 4. HANDLERS
  const updateSplashArtRating = useCallback((rating) => {
    setSplashArtRating(rating);
  }, []);

  const updateInGameModelRating = useCallback((rating) => {
    setInGameModelRating(rating);
  }, []);

  const submitRating = useCallback(async () => {
    if (!user) {
      error(toastMessages.signIn.info);
      return;
    }

    if (splashArtRating === 0 || inGameModelRating === 0) {
      info(toastMessages.rating.has_missing);
      return;
    }

    const payload = {
      splashArtRating,
      inGameModelRating
    };

    mutation.mutate(payload);
  }, [user, splashArtRating, inGameModelRating, mutation, info]);

  return {
    // Data
    userRating: existingRating,
    
    // Form State
    splashArtRating,
    inGameModelRating,
    
    // Status
    isLoading, // Initial load
    isSubmitting: mutation.isPending, // Submission in progress
    
    // Actions
    updateSplashArtRating,
    updateInGameModelRating,
    submitRating,
  };
};

export default useSkinRatingData;