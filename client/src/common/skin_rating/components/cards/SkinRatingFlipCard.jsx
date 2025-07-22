import React from 'react';
import * as MUI from '@mui/material';

const SkinRatingFlipCard = ({ imageUrl, onButtonClick }) => {
  return (
    <MUI.Box
      width="100%"
      sx={{
        // perspective: '1000px',
        aspectRatio: '5 / 9',
      }}
    >
      <MUI.Box
        sx={{
          'position': 'relative',
          'width': '100%',
          'height': '100%',
          'transformStyle': 'preserve-3d',
          'transition': 'transform 0.6s',
          '&:hover': {
            transform: 'rotateY(180deg)',
          },
        }}
      >
        {/* Front Side */}
        <MUI.Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: '1',
            overflow: 'hidden',
            boxShadow: 3,
          }}
        >
          <MUI.Box
            component="img"
            src={imageUrl}
            alt="Champion"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </MUI.Box>

        {/* Back Side */}
        <MUI.Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '1',
            backfaceVisibility: 'hidden',
            backgroundColor: 'primary.main',
            color: 'white',
            transform: 'rotateY(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
          }}
        >
          <MUI.Button
            variant="contained"
            color="secondary"
            onClick={onButtonClick}
          >
            Rate Skin
          </MUI.Button>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
};

export default SkinRatingFlipCard;
