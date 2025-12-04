import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, CardMedia, Stack, Button, CircularProgress, Avatar, Chip } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { toggleVideoLike } from '../../api/championApi';
import { useAuth } from '../../AuthProvider';
import SignInDialog from '../SignInDialog';

const VideoPlayer = ({ videoData, autoplay = false, isLoading, selectionsComplete, currentSelections }) => {
  const navigate = useNavigate();
  const { user, setLoading } = useAuth();
  const [hasViewed, setHasViewed] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    // Check session storage on mount/videoData change
    if (videoData?._id) {
      const sessionKey = `viewed_${videoData._id}`;
      if (sessionStorage.getItem(sessionKey)) {
        setHasViewed(true);
      } else {
        setHasViewed(false);
      }
      
      // Initialize likes from videoData
      setLikes(videoData.likes || 0);
      setIsLiked(!!videoData.isLiked);
    }
  }, [videoData]);

  const handleTimeUpdate = (event) => {
    if (!videoData || hasViewed) return;

    const currentTime = event.target.currentTime;
    // 5-second threshold
    if (currentTime > 5) {
      const sessionKey = `viewed_${videoData._id}`;
      
      // Double-check storage to be safe
      if (!sessionStorage.getItem(sessionKey)) {
        setHasViewed(true);
        sessionStorage.setItem(sessionKey, 'true');
        
        // Fire and forget view increment
        axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/videos/${videoData._id}/view`)
          .catch(err => console.error('Failed to increment view', err));
      }
    }
  };

  const handleSignIn = () => {
    setLoading(true);
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/auth/google`, '_self');
  };

  const handleLike = async () => {
    if (!videoData?._id) return;
    
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }
    
    try {
      const response = await toggleVideoLike(videoData._id);
      setLikes(response.likes);
      setIsLiked(response.isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // If unauthorized, redirect to login or show message?
      // interceptors handle 401 redirect
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
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
        boxShadow: '8px 8px 0px #000000',
        border: '3px solid #000000',
        backgroundColor: '#d0f5d5',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '10px 10px 0px #000000',
        },
      }}
    >
      {isLoading ? (
        <Box
          width="100%"
          height="100%"
          flexGrow={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress sx={{ color: 'black' }} />
        </Box>
      ) : videoData ? (
        <Box height="100%" display="flex" flexDirection="column">
          {/* Header */}
          <Box
            sx={{
              border: '3px solid #000000',
              backgroundColor: '#FFDE00',
              padding: '8px 10px', // Wider padding for horizontal stretch
              marginBottom: '15px',
              boxShadow: '4px 4px 0px #000000',
              display: 'inline-block', // Only wrap content
              alignSelf: 'center', // Center horizontally in flex column
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 900, 
                letterSpacing: 1, 
                textAlign: 'center',
                textTransform: 'uppercase',
                color: 'black'
              }}
            >
              {videoData.title}
            </Typography>
          </Box>

          {/* Video Player */}
          <Box sx={{ position: 'relative', flexGrow: 1, backgroundColor: '#000' }}>
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              {videoData.provider === 'mux' && videoData.playbackUrl ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <MuxPlayer
                    streamType="on-demand"
                    src={videoData.playbackUrl}
                    autoplay={autoplay}
                    playsInline
                    preload="metadata"
                    style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                    onTimeUpdate={handleTimeUpdate}
                  />
                </Box>
              ) : (
                <CardMedia
                  component="iframe"
                  src={`https://www.youtube.com/embed/${new URL(videoData.videoURL).searchParams.get('v')}`}
                  title={videoData.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Metadata Footer */}
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
            {/* Contributor Info */}
            {videoData.contributor && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack spacing={0}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1 }}>
                    Contributed by
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {videoData.contributor.username || 'Unknown'}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {/* Stats */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={isLiked ? <FavoriteIcon style={{ color: 'red', fontSize: '1rem' }} /> : <FavoriteBorderIcon style={{ color: 'black', fontSize: '1rem' }} />}
                label={likes}
                size="small"
                onClick={handleLike}
                sx={{
                  backgroundColor: 'white',
                  border: '2px solid black',
                  borderRadius: '0px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#ffebee', // Light red hover
                    boxShadow: '2px 2px 0px black',
                    // transform: 'translate(-1px, -1px)',
                  },
                  '&:active': {
                    boxShadow: 'none',
                    transform: 'translate(1px, 1px)',
                  }
                }}
              />
              <Chip
                icon={<VisibilityIcon style={{ color: 'black', fontSize: '1rem' }} />}
                label={videoData.views || 0}
                size="small"
                sx={{
                  backgroundColor: 'white',
                  border: '2px solid black',
                  borderRadius: '0px',
                  fontWeight: 'bold'
                }}
              />
              <Chip
                icon={<CalendarTodayIcon style={{ color: 'black', fontSize: '1rem' }} />}
                label={formatDate(videoData.createdAt)}
                size="small"
                sx={{
                  backgroundColor: 'white',
                  border: '2px solid black',
                  borderRadius: '0px',
                  fontWeight: 'bold'
                }}
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
      ) : selectionsComplete ? (
        <Box
          width="100%"
          height="100%"
          minHeight="inherit"
          flexGrow={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={3}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', textAlign: 'center' }}>
            NO INTERACTION FOUND
          </Typography>
          <Button
            variant="contained"
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
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.2rem',
              borderRadius: '0px',
              border: '2px solid #000',
              boxShadow: '4px 4px 0px #000',
              padding: '10px 30px',
              textTransform: 'uppercase',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#000',
                boxShadow: '6px 6px 0px #000',
                transform: 'translate(-2px, -2px)',
              },
              '&:active': {
                boxShadow: '2px 2px 0px #000',
                transform: 'translate(2px, 2px)',
              },
            }}
          >
            Add Interaction
          </Button>
        </Box>
      ) : (
        <Box
          width="100%"
          height="100%"
          minHeight="inherit"
          flexGrow={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
            Select abilities to view interaction
          </Typography>
        </Box>
      )}
      <SignInDialog
        dialogOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        handleSignIn={handleSignIn}
      />
    </Card>
  );
};

export default VideoPlayer;
