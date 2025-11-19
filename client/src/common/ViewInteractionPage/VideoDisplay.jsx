import React from 'react';
import { Box, Card, Typography, CardMedia, Stack } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';

const VideoPlayer = ({ videoData, autoplay = false }) => {
  return (
    <Card
      sx={{
        width: '60vw',
        height: '100%',
        borderRadius: '5px',
        boxShadow: 10,
        border: '3px solid',
        borderColor: '#785A28',
      }}
    >
      {videoData ? (
        <Box height="100%">
          <Stack alignItems="center" spacing="-5px" marginY="10px">
            <Typography variant="h6">{videoData.title.toUpperCase()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {videoData.description}
            </Typography>
          </Stack>
          <Box marginBottom="" sx={{ position: 'relative', aspectRatio: '16/9' }}>
            {videoData.provider === 'mux' && videoData.playbackUrl ? (
              <Box sx={{ position: 'absolute', top: 0, left: '1%', width: '98%', height: '100%' }}>
                <MuxPlayer
                  streamType="on-demand"
                  src={videoData.playbackUrl}
                  autoplay={autoplay}
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', height: '100%', borderRadius: '10px', backgroundColor: 'black' }}
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
                  left: '1%',
                  width: '98%',
                  height: '100%',
                  borderRadius: '10px',
                }}
              />
            )}
          </Box>
        </Box>
      ) : (
        <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="body1" color="text.secondary">
            Select abilities to view the interaction video
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default VideoPlayer;
