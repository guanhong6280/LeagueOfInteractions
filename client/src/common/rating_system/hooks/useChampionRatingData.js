import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submitChampionRating, getUserChampionRating } from "../../../api/championApi";
import { toastMessages, useToast } from '../../../toast/useToast';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { queryKeys as ratingSectionQueryKeys } from '../../../hooks/useRatingSectionData';

const initialRatings = {
  fun: 0,
  skill: 0,
  synergy: 0,
  laning: 0,
  teamfight: 0,
  opponentFrustration: 0,
  teammateFrustration: 0,
};

const queryKeys = {
  userRating: (championId, userId) => ['user-champion-rating', championId, userId],
};

const useChampionRatingData = (championId) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();

  // Local state for the form inputs
  const [values, setValues] = useState(initialRatings);

  // 1. QUERY: Fetch existing user rating
  const { 
    data: existingRating, 
    isLoading 
  } = useQuery({
    queryKey: queryKeys.userRating(championId, user?.id),
    queryFn: async () => {
      const response = await getUserChampionRating(championId);
      return response.success ? response.data : null;
    },
    enabled: !!championId && !!user, // Only run if logged in
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 mins
  });

  // 2. EFFECT: Sync fetched data to form values
  useEffect(() => {
    if (existingRating) {
      setValues({
        fun: existingRating.funRating || 0,
        skill: existingRating.skillRating || 0,
        synergy: existingRating.synergyRating || 0,
        laning: existingRating.laningRating || 0,
        teamfight: existingRating.teamfightRating || 0,
        opponentFrustration: existingRating.opponentFrustrationRating || 0,
        teammateFrustration: existingRating.teammateFrustrationRating || 0,
      });
    } else {
      // Reset if no rating found (or user logged out)
      setValues(initialRatings);
    }
  }, [existingRating]);

  // 3. MUTATION: Submit Rating
  const mutation = useMutation({
    mutationFn: (payload) => submitChampionRating(championId, payload),
    
    onSuccess: async (response) => {
      if (response.success) {
        success(toastMessages.rating.champion.success);

        // Invalidate user rating so form reflects saved state
        queryClient.invalidateQueries({ queryKey: queryKeys.userRating(championId, user?.id) });

        // Cancel in-flight stats requests so an older GET can't overwrite the refetch
        await queryClient.cancelQueries({ queryKey: ratingSectionQueryKeys.championStatsPrefix(championId) });
        // Invalidate champion stats (same key as useRatingSectionData) so averages re-render
        queryClient.invalidateQueries({ queryKey: ratingSectionQueryKeys.championStatsPrefix(championId) });
      } else {
        error(response.error || toastMessages.rating.champion.error);
      }
    },
    onError: () => {
      error(toastMessages.rating.champion.error);
    }
  });

  // 4. HANDLERS
  const updateRatingValue = useCallback((id, val) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  }, []);

  const submitRating = useCallback(async () => {
    if (!user) {
      error(toastMessages.signIn.info);
      return;
    }

    // Validation: Check for 0 values
    const hasMissing = Object.values(values).some((val) => !val || val < 1);
    if (hasMissing) {
      info(toastMessages.rating.has_missing);
      return;
    }

    // Map form values to API payload keys
    const payload = {
      funRating: values.fun,
      skillRating: values.skill,
      synergyRating: values.synergy,
      laningRating: values.laning,
      teamfightRating: values.teamfight,
      opponentFrustrationRating: values.opponentFrustration,
      teammateFrustrationRating: values.teammateFrustration,
    };

    mutation.mutate(payload);
  }, [user, values, mutation, error, info]);

  return {
    values,
    updateRatingValue,
    submitRating,
    isLoading,
    isSubmitting: mutation.isPending,
    hasExistingRating: !!existingRating,
  };
};

export default useChampionRatingData;