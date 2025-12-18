import React from 'react';
import * as MUI from '@mui/material';

// Rank colors for neo-brutalism badges
const rankStyles = {
  iron: { bg: '#6B6B6B', color: 'white' },
  bronze: { bg: '#CD7F32', color: 'white' },
  silver: { bg: '#C0C0C0', color: 'black' },
  gold: { bg: '#FFD700', color: 'black' },
  platinum: { bg: '#4EC9B0', color: 'black' },
  emerald: { bg: '#50C878', color: 'white' },
  diamond: { bg: '#B9F2FF', color: 'black' },
  master: { bg: '#9B4DCA', color: 'white' },
  grandmaster: { bg: '#FF4444', color: 'white' },
  challenger: { bg: '#F4C430', color: 'black' },
};

const RankBadge = ({ rank }) => {
  if (!rank) return null;

  const rankLower = rank.toLowerCase();
  const style = rankStyles[rankLower] || { bg: '#999', color: 'white' };

  return (
    <MUI.Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        bgcolor: style.bg,
        color: style.color,
        padding: '6px 16px',
        border: '3px solid black',
        borderRadius: '0px',
        boxShadow: '4px 4px 0px 0px #000000',
        fontWeight: '900',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}
    >
      🏆 {rank}
    </MUI.Box>
  );
};

export default RankBadge;

