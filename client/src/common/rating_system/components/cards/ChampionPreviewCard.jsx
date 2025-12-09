import React from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getChampionLoadingUrl } from '../../../../utils/championNameUtils';

// Helper for the "Class/Role" Badge
const RoleBadge = ({ roles }) => {
  if (!roles || roles.length === 0) return null;
  const mainRole = roles[0].toUpperCase();

  // Simple color mapping for roles
  const roleColors = {
    FIGHTER: '#FF9A8B', // Pink/Red
    TANK: '#A090F1',    // Purple
    MAGE: '#80D8FF',    // Cyan
    ASSASSIN: '#FF5252',// Red
    SUPPORT: '#B2FF59', // Green
    MARKSMAN: '#FFFF00' // Yellow
  };

  return (
    <MUI.Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        bgcolor: roleColors[mainRole] || 'white',
        color: 'black',
        px: 1,
        py: 0.5,
        fontWeight: 900,
        fontSize: '0.7rem',
        borderRight: '2px solid black',
        borderBottom: '2px solid black',
        zIndex: 2,
        boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
      }}
    >
      {mainRole}
    </MUI.Box>
  );
};

const ChampionPreviewCard = React.memo(({ championName, stats }) => {
  const navigate = useNavigate();
  const imageUrl = getChampionLoadingUrl(championName);

  // Neo-Brutalist Button Style
  const ActionButton = ({ label, onClick, color }) => (
    <MUI.Button
      onClick={(e) => {
        e.stopPropagation(); // Prevent bubbling
        onClick();
      }}
      fullWidth
      sx={{
        bgcolor: color,
        color: 'black',
        borderRadius: 0,
        border: '2px solid black',
        fontWeight: 900,
        fontSize: '0.8rem',
        py: 1,
        boxShadow: '3px 3px 0px black',
        transition: 'transform 0.1s',
        '&:hover': {
          bgcolor: color,
          filter: 'brightness(1.1)',
          transform: 'translate(-1px, -1px)',
          boxShadow: '4px 4px 0px black',
        },
        '&:active': {
          transform: 'translate(1px, 1px)',
          boxShadow: '1px 1px 0px black',
        }
      }}
    >
      {label}
    </MUI.Button>
  );

  return (
    <MUI.Box
      className="champion-card-container" // Add unique class for scoping
      sx={{
        width: '100%',
        maxWidth: '220px',
        aspectRatio: '5 / 9',
        position: 'relative',
        border: '3px solid black',
        boxShadow: '6px 6px 0px black',
        bgcolor: '#111',
        backgroundImage: 'repeating-linear-gradient(45deg, #ddd 0px, #ddd 10px, #eee 10px, #eee 20px)',
        overflow: 'hidden',
        transition: 'transform 0.1s',
        // Construct the "Control Panel" (Buttons) that sits *behind* the image
        // Actually, for sliding up, the image needs to be on top (z-index)
        // and the buttons need to be underneath or revealed.
        // BETTER APPROACH: Put buttons at the BOTTOM of the container (absolute).
        // Slide the Image Container UP to reveal them.
      }}
    >
      {/* --- LAYER 1: The Control Panel (Revealed on Hover) --- */}
      <MUI.Box
        boxSizing="border-box"
        alignItems="center"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '24%', // Occupy bottom half
          // bgcolor: '#F0F0F0', // REMOVED: Old grey
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 0, // Behind the cover
          // Dark Industrial Hazard Stripe
          // bgcolor: '#FF00FF'
          bgcolor: '#111',
          backgroundImage: 'repeating-linear-gradient(45deg, #ddd 0px, #ddd 10px, #eee 10px, #eee 20px)',
        }}
      >
        <MUI.Typography variant="h6" fontWeight="bold" fontSize="1.2rem">
          Leave a rating
        </MUI.Typography>
        <MUI.Box display="flex" gap={1} justifyContent="center">
          <ActionButton
            label="Champion"
            color="#FFEB3B" // Yellow
            onClick={() => navigate(`/champion-rating/${encodeURIComponent(championName)}`)}
          />
          <ActionButton
            label="Skins"
            color="#00E5FF" // Cyan
            onClick={() => navigate(`/champion-skin-details/${encodeURIComponent(championName)}`)}
          />
        </MUI.Box>
      </MUI.Box>


      {/* --- LAYER 2: The Data Plate (Slides Up) --- */}
      <MUI.Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'white',
          zIndex: 1,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy mechanical spring
          display: 'flex',
          flexDirection: 'column',
          // THE HOVER TRIGGER:
          // Target the specific parent class we added
          '.champion-card-container:hover &': {
            transform: 'translateY(-24%)', // Slide up by 24% (matching the control panel height)
          },
          // TEMP: For debugging, uncomment below line to keep it always open
          // transform: 'translateY(-24%)',
        }}
      >
        {/* Role Badge (Top Left) */}
        <RoleBadge roles={stats?.roles} />

        {/* Skin Count Badge (Top Right) */}
        <MUI.Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bgcolor: 'black',
            color: 'white',
            px: 1,
            py: 0.5,
            fontWeight: 'bold',
            fontSize: '0.7rem',
            zIndex: 2,
            borderLeft: '2px solid white',
            borderBottom: '2px solid white'
          }}
        >
          {stats?.totalSkins || 0} SKINS
        </MUI.Box>

        {/* Image Container */}
        <MUI.Box
          sx={{
            width: '100%',
            flexGrow: 1, // Takes up available space
            position: 'relative',
            borderBottom: '3px solid black',
            overflow: 'hidden'
          }}
        >
          <MUI.Box
            component="img"
            src={imageUrl}
            alt={championName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </MUI.Box>

        {/* Footer Stats (Always visible on the plate) */}
        <MUI.Box
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          boxSizing="border-box"
          sx={{
            height: '100px',
            bgcolor: 'white',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '3px solid black', // Hard separation
            zIndex: 10,
            // Optional: Add a hard shadow lifting it up visually
            boxShadow: '0px -4px 0px rgba(0,0,0,0.1)',
          }}
        >
          {/* Name Banner - "Sticker" Style */}
          <MUI.Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              textTransform: 'uppercase',
              lineHeight: 1,
              fontSize: '1.1rem',
              bgcolor: 'black',
              color: 'white',
              display: 'inline-block', // Wrap to text width
              alignSelf: 'flex-start', // Align left
              px: 1,
              py: 0.2,
              mb: 1,
              // transform: 'rotate(-1deg)', // Slight tilt for "slapped on" look
              boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
            }}
          >
            {championName}
          </MUI.Typography>

          {/* Stats Grid */}
          <MUI.Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            {/* Stat 1: Skin Rating */}
            <MUI.Box>
              <MUI.Box sx={{ 
                  border: '2px solid black', 
                  p: 0.2, 
                  textAlign: 'center', 
                  bgcolor: '#E0F2F1',
                  boxShadow: '2px 2px 0px black', // Hard shadow
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'translate(-1px, -1px)', boxShadow: '3px 3px 0px black' }
              }}>
                <MUI.Typography variant="caption" display="block" fontWeight="bold" fontSize="0.6rem" sx={{ letterSpacing: '1px' }}>
                  SKINS
                </MUI.Typography>
                <MUI.Typography variant="body2" fontWeight="900">
                  {`${stats?.averageSkinRating}/10` || 'N/A'}
                </MUI.Typography>
              </MUI.Box>
            </MUI.Box>
            {/* Stat 2: Champ Fun Rating */}
            <MUI.Box>
              <MUI.Box sx={{ 
                  border: '2px solid black', 
                  p: 0.2, 
                  textAlign: 'center', 
                  bgcolor: '#FFF3E0',
                  boxShadow: '2px 2px 0px black', // Hard shadow
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'translate(-1px, -1px)', boxShadow: '3px 3px 0px black' }
              }}>
                <MUI.Typography variant="caption" display="block" fontWeight="bold" fontSize="0.6rem" sx={{ letterSpacing: '1px' }}>
                  FUN
                </MUI.Typography>
                <MUI.Typography variant="body2" fontWeight="900">
                  {`${stats?.championRatingStats?.avgFun}/10` || 'N/A'}
                </MUI.Typography>
              </MUI.Box>
            </MUI.Box>
          </MUI.Box>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
});

export default ChampionPreviewCard;

