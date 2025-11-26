import React from 'react';
import * as MUI from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import useRatingData from '../../hooks/useRatingData';

const SkinRatingSection = ({ currentSkinId, championName }) => {
  const {
    userRating,
    isLoading,
    isSubmitting,
    error,
    splashArtRating,
    inGameModelRating,
    updateSplashArtRating,
    updateInGameModelRating,
    submitRating,
  } = useRatingData(currentSkinId);

  const handleStarClick = (ratingType, value) => {
    if (ratingType === 'splash') {
      updateSplashArtRating(value);
    } else {
      updateInGameModelRating(value);
    }
  };

  const handleRatingSubmit = async () => {
    await submitRating();
  };

  const renderStarRating = (ratingType, currentRating, onStarClick) => {
    return (
      <MUI.Box display="flex" gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MUI.IconButton
            key={star}
            onClick={() => onStarClick(ratingType, star)}
            size="small"
            sx={{ p: 0.5 }}
          >
            {star <= currentRating ? (
              <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            ) : (
              <StarBorderIcon sx={{ color: 'grey.400', fontSize: 20 }} />
            )}
          </MUI.IconButton>
        ))}
      </MUI.Box>
    );
  };

  if (isLoading) {
    return (
      <MUI.Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <MUI.CircularProgress size={40} />
      </MUI.Box>
    );
  }

  return (
    <MUI.Box>
      {/* Rating Form */}
      <MUI.Card sx={{ mb: 3 }}>
        <MUI.CardContent>
          <MUI.Typography variant="h6" fontWeight="bold" mb={2}>
            Rate This Skin
          </MUI.Typography>

          {!currentSkinId ? (
            <MUI.Alert severity="info">
              Please select a skin to rate
            </MUI.Alert>
          ) : (
            <MUI.Stack spacing={3}>
              {/* Splash Art Rating */}
              <MUI.Box>
                <MUI.Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Splash Art Rating
                </MUI.Typography>
                {renderStarRating('splash', splashArtRating, handleStarClick)}
                <MUI.Typography variant="body2" color="text.secondary" mt={0.5}>
                  {splashArtRating > 0 ? `${splashArtRating} star${splashArtRating > 1 ? 's' : ''}` : 'Click to rate'}
                </MUI.Typography>
              </MUI.Box>

              {/* In-Game Model Rating */}
              <MUI.Box>
                <MUI.Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  In-Game Model Rating
                </MUI.Typography>
                {renderStarRating('model', inGameModelRating, handleStarClick)}
                <MUI.Typography variant="body2" color="text.secondary" mt={0.5}>
                  {inGameModelRating > 0 ? `${inGameModelRating} star${inGameModelRating > 1 ? 's' : ''}` : 'Click to rate'}
                </MUI.Typography>
              </MUI.Box>

              {error && (
                <MUI.Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </MUI.Alert>
              )}

              <MUI.Button
                variant="contained"
                onClick={handleRatingSubmit}
                disabled={isSubmitting || splashArtRating === 0 || inGameModelRating === 0}
                sx={{ alignSelf: 'flex-start' }}
              >
                {isSubmitting ? (
                  <MUI.Box display="flex" alignItems="center" gap={1}>
                    <MUI.CircularProgress size={16} color="inherit" />
                    Submitting...
                  </MUI.Box>
                ) : userRating ? (
                  'Update Rating'
                ) : (
                  'Submit Rating'
                )}
              </MUI.Button>
            </MUI.Stack>
          )}
        </MUI.CardContent>
      </MUI.Card>
    </MUI.Box>
  );
};

export default SkinRatingSection; 