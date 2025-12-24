import React from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ActivityCard = ({ activity }) => {
  const navigate = useNavigate();
  const { type, date, championName, championId, skinId, skinName, data } = activity;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const getImageUrl = () => {
    if (championName) {
      // Use Data Dragon for champion/skin images
      // Format: https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/Ashe_0.jpg
      // For specific skins, we need the skin number (e.g. 1001 for skin 1).
      // Assuming championId is the key (e.g. "Ashe")
      // If we don't have the skin num, default to base skin (_0)
      
      const skinNum = skinId ? skinId % 1000 : 0; 
      // Note: skinId logic can vary, usually it's ChampID * 1000 + skinNum.
      // But resolving actual skin splash from skinId without metadata is tricky.
      // Safe default: use champion tile.
      
      return `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championName}_0.jpg`;
    }
    return ''; // Fallback handled by CSS/Box
  };

  const getTitle = () => {
    return skinName || championName || (skinId ? `Skin #${skinId}` : 'Unknown');
  };

  const handleClick = () => {
    // Prefer championId from top-level or data
    const safeChampName = championName || data?.championName; 
    
    if (type.includes('skin')) {
      if (safeChampName) {
        navigate(`/champion-skin-details/${championId}`, { state: { skinId } });
      }
    } else {
      if (safeChampName) {
        navigate(`/champion-rating/${championId}`);
      }
    }
  };

  const renderContent = () => {
    if (type.includes('Rating')) {
      const ratings = Object.entries(data)
        .filter(([key]) => key.includes('Rating') || key.includes('rating'));

      return (
        <MUI.Box display="flex" gap="8px" flexWrap="wrap">
          {ratings.map(([key, value]) => {
            const cleanKey = key.replace(/Rating/i, '').replace(/([A-Z])/g, ' $1').trim();
            const displayName = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
            const isSkin = type.toLowerCase().includes('skin');

            return (
              <MUI.Tooltip key={key} title={displayName}>
                <MUI.Chip
                  label={isSkin ? `${displayName}: ${value}/10` : `${value}/10`}
                  size="small"
                  sx={{
                    bgcolor: 'white',
                    border: '2px solid black',
                    borderRadius: '0px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'default',
                  }}
                />
              </MUI.Tooltip>
            );
          })}
        </MUI.Box>
      );
    } else if (type.includes('Comment') && data.comment) {
      return (
        <MUI.Typography
          sx={{
            fontSize: '13px',
            color: '#444',
            py: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          "{data.comment}"
        </MUI.Typography>
      );
    }
    return null;
  };

  return (
    <MUI.Box
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        mt: 2,
        padding: '20px',
        bgcolor: 'white',
        border: '3px solid black',
        boxShadow: '4px 4px 0px 0px #000000',
        transition: 'all 0.1s ease',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '6px 6px 0px 0px #000000',
        },
      }}
    >
      {/* Badge / Legend */}
      <MUI.Box
        sx={{
          position: 'absolute',
          top: '-16px',
          left: '16px',
          bgcolor: type.includes('Rating') ? '#FFD93D' : '#FF6B9D',
          border: '2px solid black',
          px: 1,
          py: 0.5,
          fontWeight: 'bold',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          zIndex: 1,
        }}
      >
        {type.includes('Rating') ? 'RATING' : 'COMMENT'}
      </MUI.Box>

      {/* Main Content */}
      <MUI.Box display="flex" gap={2} flex={1}>
        <MUI.Box flex="1">
          <MUI.Box display="flex" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
            <MUI.Typography
              sx={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'black',
                lineHeight: 1.3
              }}
            >
              {getTitle()}
            </MUI.Typography>

            <MUI.Tooltip title={type.includes('skin') ? 'Skin' : 'Champion'}>
              <MUI.IconButton
                disableRipple
                sx={{
                  bgcolor: 'white',
                  border: '2px solid black',
                  borderRadius: '0px',
                  padding: '0 8px',
                  height: '24px',
                  width: 'auto',
                }}
              >
                <MUI.Typography fontWeight="800" fontSize="10px" color="#000000" sx={{ textTransform: 'uppercase' }}>
                  {type.includes('skin') ? 'SKIN' : 'CHAMPION'}
                </MUI.Typography>
              </MUI.IconButton>
            </MUI.Tooltip>

            <MUI.Typography
              sx={{
                fontSize: '12px',
                color: '#999',
                whiteSpace: 'nowrap',
              }}
            >
               • {formatDate(date)}
            </MUI.Typography>
          </MUI.Box>

          {renderContent()}
        </MUI.Box>

        {/* Right: Image */}
        <MUI.Box
          sx={{
            width: 80,
            height: 80,
            border: '2px solid black',
            bgcolor: '#eee',
            backgroundImage: `url(${getImageUrl()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            flexShrink: 0,
          }}
        />
      </MUI.Box>
    </MUI.Box>
  );
};

export default ActivityCard;

