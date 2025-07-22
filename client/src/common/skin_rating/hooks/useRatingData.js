import { useState, useEffect } from 'react';
import { submitSkinRating, getUserSkinRating } from '../../../api/championApi';
import { useAuth } from '../../../AuthProvider';

const useRatingData = (currentSkinId) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      setError(null);

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
      setError('Failed to load rating data');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async () => {
    if (!user) {
      setError('Please sign in to rate skins');
      return false;
    }

    if (splashArtRating === 0 || inGameModelRating === 0) {
      setError('Please rate both splash art and in-game model');
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const ratingData = {
        splashArtRating,
        inGameModelRating
      };

      const response = await submitSkinRating(currentSkinId, ratingData);

      if (response.success) {
        // Reload rating data
        await loadRatingData();
        setError(null);
        return true;
      } else {
        setError(response.error || 'Failed to submit rating');
        return false;
      }
    } catch (err) {
      setError('Failed to submit rating');
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
    error,
    splashArtRating,
    inGameModelRating,
    updateSplashArtRating,
    updateInGameModelRating,
    submitRating,
    loadRatingData,
  };
};

export default useRatingData; 