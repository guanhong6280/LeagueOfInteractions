import React from 'react';
import { Box, Card, Typography, CardMedia, Stack, Button, CircularProgress } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { useNavigate } from 'react-router-dom';

const VideoPlayer = ({ videoData, autoplay = false, isLoading, selectionsComplete, currentSelections }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        width: '60vw',
        height: '100%',
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
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress sx={{ color: 'black' }} />
        </Box>
      ) : videoData ? (
        <Box height="100%" display="flex" flexDirection="column">
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              borderBottom: '3px solid #000000',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 1 }}>
              {videoData.title.toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
              {videoData.description}
            </Typography>
          </Stack>
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
        </Box>
      ) : selectionsComplete ? (
        <Box
          width="100%"
          height="100%"
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
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
            Select abilities to view interaction
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default VideoPlayer;
