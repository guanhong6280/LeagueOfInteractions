import React from 'react';
import * as MUI from "@mui/material";
import SkinRatingFlipCard from './SkinRatingFlipCard';

const BaseSkinRatingCards = (props) => {

  return (
    <MUI.Stack
      minWidth="100%"
      spacing={1}
      alignItems="center"
      borderRadius={2}
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
        }}
      // overflow="hidden"
      >
        <SkinRatingFlipCard
          imageUrl={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${props?.championName}_0.jpg`}
          onButtonClick={() => console.log('Rate Skin Button Clicked')}
        />

        {/* Badge for number of skins */}
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
          5 skins
        </MUI.Box>
      </MUI.Box>

      <MUI.Typography variant="h6">{props?.championName}</MUI.Typography>
    </MUI.Stack>
  )
}

export default BaseSkinRatingCards