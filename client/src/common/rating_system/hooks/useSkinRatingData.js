import { useState, useEffect } from 'react';
import { submitSkinRating, getUserSkinRating } from '../../../api/championApi';
import { toastMessages } from '../../../toast/useToast';
import { useToast } from '../../../toast/useToast';
import useCurrentUser from '../../../hooks/useCurrentUser';

const useSkinRatingData = (currentSkinId) => {
  const { user } = useCurrentUser();
  const [userRating, setUserRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error, info } = useToast();

  // Form state
  const [splashArtRating, setSplashArtRating] = useState(0);
  const [inGameModelRating, setInGameModelRating] = useState(0);

  useEffect(() => {
    if (currentSkinId && user) {
      loadRatingData();
    } else {
      setIsLoading(false);
    }
  }, [currentSkinId, user]);

  const loadRatingData = async () => {
    try {
      setIsLoading(true);

      // Load only user's rating
      const userRatingResponse = await getUserSkinRating(currentSkinId);

      if (userRatingResponse.success && userRatingResponse.data) {
        setUserRating(userRatingResponse.data);
        setSplashArtRating(userRatingResponse.data.splashArtRating);
        setInGameModelRating(userRatingResponse.data.inGameModelRating);
      } else {
        // Reset ratings if no existing rating found
        setUserRating(null);
        setSplashArtRating(0);
        setInGameModelRating(0);
      }
    } catch (err) {
      error(toastMessages.rating.failed_to_load);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async () => {
    if (!user) {
      info(toastMessages.signIn.info);
      return false;
    }

    if (splashArtRating === 0 || inGameModelRating === 0) {
      info(toastMessages.rating.has_missing);
      return false;
    }

    try {
      setIsSubmitting(true);

      const ratingData = {
        splashArtRating,
        inGameModelRating
      };

      const response = await submitSkinRating(currentSkinId, ratingData);

      if (response.success) {
        // Reload rating data
        await loadRatingData();
        success(toastMessages.rating.skin.success);
        return true;
      } else {
        error(response.error || toastMessages.rating.skin.error);
        return false;
      }
    } catch (err) {
      error(toastMessages.rating.skin.error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSplashArtRating = (rating) => {
    setSplashArtRating(rating);
  };

  const updateInGameModelRating = (rating) => {
    setInGameModelRating(rating);
  };

  return {
    userRating,
    isLoading,
    isSubmitting,
    splashArtRating,
    inGameModelRating,
    updateSplashArtRating,
    updateInGameModelRating,
    submitRating,
    loadRatingData,
  };
};

export default useSkinRatingData; 