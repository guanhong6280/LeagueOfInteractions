import React from 'react';
import * as MUI from '@mui/material';
import FavoriteChampionsGrid from './FavoriteChampionsGrid';
import FavoriteSkinsGrid from './FavoriteSkinsGrid';

const PersonalityShowcase = ({ favoriteChampions, favoriteSkins }) => {
  return (
    <MUI.Box
      sx={{
        width: '100%',
        marginBottom: '40px',
      }}
    >
      {/* Section Title */}
      <MUI.Typography
        sx={{
          fontSize: '36px',
          fontWeight: '900',
          color: 'black',
          textTransform: 'uppercase',
          letterSpacing: '-1px',
          marginBottom: '25px',
          textShadow: '3px 3px 0px rgba(255,255,255,0.5)',
        }}
      >
        ⭐ Personality Showcase
      </MUI.Typography>

      <MUI.Stack spacing="25px">
        {/* Favorite Champions Card */}
        <MUI.Box
          sx={{
            bgcolor: '#FFD93D', // Bright yellow
            border: '4px solid black',
            boxShadow: '8px 8px 0px 0px #000000',
            padding: '30px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translate(-2px, -2px)',
              boxShadow: '10px 10px 0px 0px #000000',
            },
          }}
        >
          <MUI.Typography
            sx={{
              fontSize: '24px',
              fontWeight: '900',
              color: 'black',
              textTransform: 'uppercase',
              marginBottom: '20px',
              letterSpacing: '0.5px',
            }}
          >
            ⚔️ Favorite Champions
          </MUI.Typography>
          <FavoriteChampionsGrid champions={favoriteChampions} />
        </MUI.Box>

        {/* Favorite Skins Card */}
        <MUI.Box
          sx={{
            bgcolor: '#FF6B9D', // Hot pink
            border: '4px solid black',
            boxShadow: '8px 8px 0px 0px #000000',
            padding: '30px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translate(-2px, -2px)',
              boxShadow: '10px 10px 0px 0px #000000',
            },
          }}
        >
          <MUI.Typography
            sx={{
              fontSize: '24px',
              fontWeight: '900',
              color: 'white',
              textTransform: 'uppercase',
              marginBottom: '20px',
              letterSpacing: '0.5px',
              textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
            }}
          >
            💎 Favorite Skins
          </MUI.Typography>
          <FavoriteSkinsGrid skins={favoriteSkins} />
        </MUI.Box>
      </MUI.Stack>
    </MUI.Box>
  );
};

export default PersonalityShowcase;

