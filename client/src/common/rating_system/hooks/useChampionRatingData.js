import { useState, useEffect, useCallback } from 'react';
import { submitChampionRating, getUserChampionRating } from '../../../api/championApi';
import { useAuth } from '../../../AuthProvider';
import { toastMessages } from '../../../toast/useToast';
import { useToast } from '../../../toast/useToast';

const initialRatings = {
  fun: 0,
  skill: 0,
  synergy: 0,
  laning: 0,
  teamfight: 0,
  opponentFrustration: 0,
  teammateFrustration: 0,
};

const useChampionRatingData = (championName) => {
  const { user } = useAuth();
  const [values, setValues] = useState(initialRatings);
  const [userRating, setUserRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error, info } = useToast();

  const loadRatingData = useCallback(async () => {
    if (!championName) {
      setValues(initialRatings);
      setUserRating(null);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setValues(initialRatings);
      setUserRating(null);
      setIsLoading(false);
      return;
    }

    try {
      // setIsLoading(true);

      const response = await getUserChampionRating(championName);

      if (response.success && response.data) {
        setUserRating(response.data);
        setValues({
          fun: response.data.funRating || 0,
          skill: response.data.skillRating || 0,
          synergy: response.data.synergyRating || 0,
          laning: response.data.laningRating || 0,
          teamfight: response.data.teamfightRating || 0,
          opponentFrustration: response.data.opponentFrustrationRating || 0,
          teammateFrustration: response.data.teammateFrustrationRating || 0,
        });
      } else {
        setUserRating(null);
        setValues(initialRatings);
      }
    } catch (err) {
      error(toastMessages.rating.failed_to_load);
    } finally {
      setIsLoading(false);
    }
  }, [championName, user]);

  useEffect(() => {
    loadRatingData();
  }, [loadRatingData]);

  const submitRating = async () => {
    if (!user) {
      error(toastMessages.signIn.info);
      return false;
    }

    const hasMissing = Object.values(values).some((val) => !val || val < 1);
    if (hasMissing) {
      info(toastMessages.rating.has_missing);
      return false; 
    }

    try {
      setIsSubmitting(true);

      const payload = {
        funRating: values.fun,
        skillRating: values.skill,
        synergyRating: values.synergy,
        laningRating: values.laning,
        teamfightRating: values.teamfight,
        opponentFrustrationRating: values.opponentFrustration,
        teammateFrustrationRating: values.teammateFrustration,
      };

      const response = await submitChampionRating(championName, payload);

      if (response.success) {
        success(toastMessages.rating.champion.success);
        await loadRatingData();
        return true;
      }

      error(response.error || toastMessages.rating.champion.error);
      return false;
    } catch (err) {
      error(toastMessages.rating.champion.error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRatingValue = (id, val) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  return {
    values,
    updateRatingValue,
    submitRating,
    isLoading,
    isSubmitting,
    hasExistingRating: !!userRating,
  };
};

export default useChampionRatingData;

