import React from 'react';
import * as MUI from '@mui/material';
import { useChampion } from '../contextProvider/ChampionProvider';
import BaseSkinRatingCards from '../common/skin_rating/BaseSkinRatingCards';
import SkinRatingFlipCard from '../common/skin_rating/SkinRatingFlipCard';

const SkinRating = () => {
  const { championNames } = useChampion();

  return (
    <MUI.Box display="flex" flexDirection="column" alignItems="center">
      <MUI.Typography component="h1">
        Rate Your Favorite Skins!
      </MUI.Typography>
      <MUI.Container disableGutters maxWidth="lg" sx={{ py: 1 }}>
        <MUI.Grid2 container spacing={6}>
          {
            championNames.map((champion, index) => (
              <MUI.Grid2 item xs={12} sm={6} md={4} lg={3} key={index}>
                <BaseSkinRatingCards championName={champion} />
              </MUI.Grid2>
            ))
          }
        </MUI.Grid2>
      </MUI.Container>
    </MUI.Box>
  );
};

export default SkinRating;