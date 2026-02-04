import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, Typography, CardMedia, Stack, Button, CircularProgress, Chip, Tooltip } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Hooks & Utils
import useCurrentUser from '../../hooks/useCurrentUser';
import { useVideoActions } from '../../hooks/useVideoActions'; // ✅ New Hook
import { redirectToGoogleAuth } from '../../api/authApi';
import SignInDialog from "../../common/navigation/SignInDialog.jsx";
import { formatDateShort } from '../../utils/dateUtils';
import theme from '../../theme/theme';

const VideoPlayer = ({ videoData, autoplay = false, isLoading, selectionsComplete, currentSelections }) => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  // Logic Hooks
  const { incrementView, toggleLike } = useVideoActions();

  // Local UI State
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Use a ref to track if we've counted a view for the *current* video ID
  const viewTriggeredRef = useRef(null);

  // --- 1. View Counting Logic ---
  const handleTimeUpdate = (event) => {
    // Safety checks
    if (!videoData?._id) return;

    // If we switched videos, reset the trigger ref for the new ID
    if (viewTriggeredRef.current !== videoData._id) {
      // Check session storage immediately to sync state
      const sessionKey = `viewed_${videoData._id}`;
      if (sessionStorage.getItem(sessionKey)) {
        viewTriggeredRef.current = videoData._id; // Already viewed
        return;
      }
    } else {
      // We have already triggered a view for this specific video ID in this component lifecycle
      return;
    }

    const currentTime = event.target.currentTime;
    // 5-second threshold for a "view"
    if (currentTime > 5) {
      const sessionKey = `viewed_${videoData._id}`;

      // Double check storage (redundancy for tab switches)
      if (!sessionStorage.getItem(sessionKey)) {
        // Mark as viewed locally
        sessionStorage.setItem(sessionKey, 'true');
        viewTriggeredRef.current = videoData._id;

        // Fire mutation
        incrementView(videoData._id);
      }
    }
  };

  // --- 2. Auth Logic ---
  const handleSignIn = () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    redirectToGoogleAuth({ returnTo });
  };

  const handleLikeClick = async () => {
    if (!videoData?._id) return;
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }
    // Mutation handles the API call and Cache update
    await toggleLike(videoData._id);
  };

  // --- 4. Render Logic ---

  // A. Loading State
  if (isLoading) {
    return (
      <StyledCard>
        <CenteredBox>
          <CircularProgress sx={{ color: 'black' }} />
        </CenteredBox>
      </StyledCard>
    );
  }

  // B. Active Video State
  if (videoData) {
    return (
      <StyledCard>
        <Box height="100%" display="flex" flexDirection="column">
          {/* Header */}
          <Box
            sx={{
              border: '3px solid #000000',
              backgroundColor: 'white',
              padding: '8px 10px',
              marginBottom: '15px',
              boxShadow: '4px 4px 0px #000000',
              alignSelf: 'center',
            }}
          >
            <Typography
              variant="h6"
              fontWeight="900"
              letterSpacing={1}
              textAlign="center"
              textTransform="uppercase"
              color="black"
              sx={{
                fontWeight: 900,
                letterSpacing: 1,
                textAlign: 'center',
                textTransform: 'uppercase',
                color: 'black',
                backgroundColor: "white",
              }}>
              {videoData.title}
            </Typography>
          </Box>

          {/* Player Container */}
          <Box sx={{ position: 'relative', flexGrow: 1, backgroundColor: '#000' }}>
            {videoData.provider === 'mux' && videoData.playbackUrl ? (
              <MuxPlayer
                streamType="on-demand"
                src={videoData.playbackUrl}
                autoplay={autoplay}
                playsInline
                preload="metadata"
                style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <CardMedia
                component="iframe"
                src={`https://www.youtube.com/embed/${new URL(videoData.videoURL).searchParams.get('v')}`}
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </Box>

          {/* Footer Stats */}
          <Box
            sx={{
              marginTop: '6px',
              paddingTop: '10px',
              borderTop: '3px solid #000000',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Contributor */}
            {videoData.contributor && (
              <Stack spacing={0}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1 }}>
                  Contributed by
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                  {videoData.contributor.username || 'Unknown'}
                </Typography>
              </Stack>
            )}

            {/* Metrics */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={videoData.isLiked ? <FavoriteIcon style={{ color: 'red', fontSize: '1rem' }} /> : <FavoriteBorderIcon style={{ color: 'black', fontSize: '1rem' }} />}
                label={videoData.likes || 0}
                size="small"
                onClick={handleLikeClick}
                sx={chipStyles(true)}
              />
              <Chip
                icon={<VisibilityIcon style={{ color: 'black', fontSize: '1rem' }} />}
                label={videoData.views || 0}
                size="small"
                sx={chipStyles(false)}
              />
              <Chip
                icon={<CalendarTodayIcon style={{ color: 'black', fontSize: '1rem' }} />}
                label={formatDateShort(videoData.createdAt)}
                size="small"
                sx={chipStyles(false)}
              />
            </Stack>
          </Box>

          {/* Description Box */}
          <Box
            display="flex"
            backgroundColor="yellow"
            flex="1"
            sx={{
              padding: '6px',
              border: '2px solid black',
              boxShadow: '4px 4px 0px black',
              marginTop: '4px',
              boxSizing: 'border-box',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#333' }}>
              {videoData.description}
            </Typography>
          </Box>
        </Box>

        <SignInDialog
          dialogOpen={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
          handleSignIn={handleSignIn}
        />
      </StyledCard>
    );
  }

  // C. Empty States
  return (
    <StyledCard>
      <CenteredBox flexDirection="column" gap={3}>
        {selectionsComplete ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', textAlign: 'center' }}>
              NO INTERACTION FOUND
            </Typography>
            <Tooltip title={!user ? 'Please sign in to add interaction!' : ''}>
              <span>
                <Button
                  variant="contained"
                  disabled={!user}
                  onClick={() => navigate('/add', {
                    state: {
                      preselected: {
                        champion1: currentSelections?.champion1?.id,
                        champion2: currentSelections?.champion2?.id,
                        ability1: currentSelections?.ability1,
                        ability2: currentSelections?.ability2
                      }
                    }
                  })}
                  sx={buttonStyles}
                >
                  Add Interaction
                </Button>
              </span>
            </Tooltip>
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
            Select abilities to view interaction
          </Typography>
        )}
      </CenteredBox>
    </StyledCard>
  );
};

// --- Sub-components / Styles for cleanliness ---
const StyledCard = ({ children }) => (
  <Card
    sx={{
      width: '60vw',
      height: '100%',
      minHeight: '650px',
      display: 'flex',
      flexDirection: 'column',
      paddingY: '20px',
      paddingX: '10px',
      borderRadius: '0px',
      boxShadow: '4px 4px 0px #000000',
      border: '3px solid #000000',
      backgroundColor: theme.palette.background.neutralSide_light,
      transition: 'all 0.2s ease-in-out',
    }}
  >
    {children}
  </Card>
);

const CenteredBox = ({ children, flexDirection = 'row', gap = 0 }) => (
  <Box
    width="100%"
    height="100%"
    flexGrow={1}
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexDirection={flexDirection}
    gap={gap}
  >
    {children}
  </Box>
);

const chipStyles = (clickable) => ({
  backgroundColor: 'white',
  border: '2px solid black',
  borderRadius: '0px',
  fontWeight: 'bold',
  cursor: clickable ? 'pointer' : 'default',
  ...(clickable && {
    '&:hover': { backgroundColor: '#ffebee', boxShadow: '2px 2px 0px black' },
    '&:active': { boxShadow: 'none', transform: 'translate(1px, 1px)' }
  })
});

const buttonStyles = {
  backgroundColor: theme.palette.button.neutralSide,
  color: 'black',
  fontWeight: 900,
  fontSize: '1.2rem',
  borderRadius: '0px',
  border: '2px solid #000',
  boxShadow: '2px 2px 0px #000',
  padding: '10px 30px',
  textTransform: 'uppercase',
  '&:hover': {
    boxShadow: '4px 4px 0px #000',
    backgroundColor: theme.palette.button.neutralSide_hover,
    // transform: 'translate(-2px, -2px)',
  },
  '&:active': {
    boxShadow: '2px 2px 0px #000',
    transform: 'translate(2px, 2px)',
  },
};

export default VideoPlayer;