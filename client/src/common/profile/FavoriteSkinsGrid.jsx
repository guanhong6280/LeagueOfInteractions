import React from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FavoriteSkinsGrid = ({ skins }) => {
  const navigate = useNavigate();

  if (!skins || skins.length === 0) {
    return (
      <MUI.Box
        sx={{
          padding: '20px',
          textAlign: 'center',
          color: '#000000',
          fontWeight: 'bold',
        }}
      >
        No Favorite Skins Selected
      </MUI.Box>
    );
  }

  const getSkinSplashUrl = (skin) => {
    if (!skin) return null;
    // Use the skin's splash art or tileSplashPath
    return skin.splashPath || skin.tileSplashPath || null;
  };

  return (
    <MUI.Box
      sx={{
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
      }}
    >
      {skins.map((skin, index) => (
        <MUI.Box
          key={skin.skinId || index}
          onClick={() => navigate(`/skin-rating/${skin.championId}?skinId=${skin.skinId}`)}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}
        >
          {/* Skin Image */}
          <MUI.Box
            sx={{
              width: '150px',
              height: '100px',
              border: '4px solid black',
              boxShadow: '6px 6px 0px 0px #000000',
              bgcolor: '#ccc',
              backgroundImage: getSkinSplashUrl(skin) ? `url(${getSkinSplashUrl(skin)})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '8px 8px 0px 0px #000000',
                transform: 'translate(-2px, -2px)',
              },
            }}
          />

          {/* Skin Name */}
          <MUI.Typography
            sx={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: 'black',
              textAlign: 'center',
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {skin.name}
          </MUI.Typography>
        </MUI.Box>
      ))}
    </MUI.Box>
  );
};

export default FavoriteSkinsGrid;

