import React from 'react';
import * as MUI from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Palette as PaletteIcon,
  ThreeDRotation as ModelIcon
} from '@mui/icons-material';
import useSkinRatingData from '../../hooks/useSkinRatingData';
import NeoRatingCard from '../common/NeoRatingCard';
import NeoStatsCard from '../common/NeoStatsCard';
import theme from '../../../../theme/theme';

const SkinRatingSection = ({ currentSkinId, skinStats, championId, championName }) => {
  const {
    userRating,
    isSubmitting,
    splashArtRating,
    inGameModelRating,
    updateSplashArtRating,
    updateInGameModelRating,
    submitRating,
  } = useSkinRatingData(currentSkinId, { championId, championName });

  const handleRatingSubmit = async () => {
    await submitRating();
  };


  const ratingFields = [
    {
        id: 'splash',
        label: 'Splash Art Rating',
        min: 1,
        max: 10,
        step: 1
    },
    {
        id: 'model',
        label: 'In-Game Model Rating',
        min: 1,
        max: 10,
        step: 1
    }
  ];

  const handleRatingChange = (id, val) => {
    if (id === 'splash') {
      updateSplashArtRating(val);
    } else {
      updateInGameModelRating(val);
    }
  };

  const currentValues = {
    splash: splashArtRating,
    model: inGameModelRating
  };

  const statsSections = [
    {
      items: [
        {
          icon: PaletteIcon,
          label: 'SPLASH ART QUALITY',
          value: skinStats?.averageSplashRating || 0,
          color: '#FF4081'
        },
        {
          icon: ModelIcon,
          label: 'IN-GAME MODEL QUALITY',
          value: skinStats?.averageModelRating || 0,
          color: '#7C4DFF'
        }
      ]
    }
  ];

  return (
    <MUI.Box>
        {!currentSkinId ? (
            <MUI.Alert severity="info" sx={{border: '3px solid black', borderRadius: 0, boxShadow: '4px 4px 0px black'}}>
                Please select a skin to rate
            </MUI.Alert>
        ) : (
            <MUI.Box>
                <Grid container spacing={4}>
                  {/* Stats Card */}
                  <Grid size={{ xs: 12, md: 6 }} display="flex">
                    <NeoStatsCard
                      title="COMMUNITY RATINGS"
                      sections={statsSections}
                    />
                  </Grid>

                  {/* Rating Card */}
                  <Grid size={{ xs: 12, md: 6 }} display="flex">
                    <NeoRatingCard
                        title="RATE THIS SKIN"
                        fields={ratingFields}
                        values={currentValues}
                        onChange={handleRatingChange}
                        onSubmit={handleRatingSubmit}
                        submitLabel={isSubmitting ? "SUBMITTING..." : (userRating ? "UPDATE RATING" : "SUBMIT RATING")}
                        badgeText="YOUR TURN"
                    />
                  </Grid>
                </Grid>
            </MUI.Box>
        )}
    </MUI.Box>
  );
};

export default SkinRatingSection; 