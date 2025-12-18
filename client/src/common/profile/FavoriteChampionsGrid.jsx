import React from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useVersion } from '../../contextProvider/VersionProvider';

const FavoriteChampionsGrid = ({ champions }) => {
  const navigate = useNavigate();
  const { version } = useVersion();

  if (!champions || champions.length === 0) {
    return (
      <MUI.Box
        sx={{
          padding: '20px',
          textAlign: 'center',
          color: '#000000',
          fontWeight: 'bold',
        }}
      >
        No Favorite Champions Selected
      </MUI.Box>
    );
  }

  const getChampionImageUrl = (championName) => {
    if (!version) return null;
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
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
      {champions.map((championName, index) => (
        <MUI.Box
          key={index}
          onClick={() => navigate(`/champion-rating/${championName}`)}
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
          {/* Champion Image */}
          <MUI.Box
            sx={{
              width: '100px',
              height: '100px',
              border: '4px solid black',
              boxShadow: '6px 6px 0px 0px #000000',
              bgcolor: 'white',
              backgroundImage: `url(${getChampionImageUrl(championName)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '8px 8px 0px 0px #000000',
                transform: 'translate(-2px, -2px)',
              },
            }}
          />

          {/* Champion Name */}
          <MUI.Typography
            sx={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'black',
              textAlign: 'center',
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {championName}
          </MUI.Typography>
        </MUI.Box>
      ))}
    </MUI.Box>
  );
};

export default FavoriteChampionsGrid;

