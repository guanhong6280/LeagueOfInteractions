import React from 'react';
import * as MUI from '@mui/material';
import SkinRatingFlipCard from './SkinRatingFlipCard';
import { useNavigate } from 'react-router-dom';
import { getChampionLoadingUrl } from '../../../../utils/championNameUtils';

const BaseSkinRatingCards = React.memo(({ championName, stats }) => {
  const navigate = useNavigate();
  return (
    <MUI.Stack
      spacing={1}
      alignItems="center"
      borderRadius={2}
      sx={{ 
        width: '100%',
        maxWidth: '200px' // Ensure consistent max width
      }}
    >
      <MUI.Box
        position="relative"
        width={'100%'}
        borderRadius={1}
        sx={{
          aspectRatio: '5 / 9',
          boxShadow: 3,
          overflow: 'hidden',
          backgroundColor: 'white',
          minHeight: '200px', // Ensure minimum height
        }}
      >
        <SkinRatingFlipCard
          imageUrl={getChampionLoadingUrl(championName)}
          onButtonClick={() => navigate(`/champion-skin-details/${encodeURIComponent(championName)}`)}
        />

        {/* Badge for number of skins */}
        {stats && (
          <MUI.Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              fontSize: 12,
              borderRadius: 1,
            }}
          >
            {stats.totalSkins} skins
          </MUI.Box>
        )}
      </MUI.Box>

      <MUI.Box textAlign="center" width="100%">
        <MUI.Typography variant="h6" gutterBottom>
          {championName}
        </MUI.Typography>
        
        {stats && (
          <MUI.Typography variant="body2" color="text.secondary">
            {stats.averageRating}★ ({stats.totalRatings} ratings)
          </MUI.Typography>
        )}
      </MUI.Box>
    </MUI.Stack>
  );
});

export default BaseSkinRatingCards;
