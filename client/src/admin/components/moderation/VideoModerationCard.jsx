import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as MUI from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MuxPlayer from '@mux/mux-player-react';

const formatDate = (value) => {
  try {
    if (!value) return 'Unknown date';
    return new Date(value).toLocaleString();
  } catch (error) {
    return value || 'Unknown date';
  }
};

const formatDuration = (seconds) => {
  if (seconds == null) return '—';
  const rounded = Math.max(0, Math.round(seconds));
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(
      2,
      '0'
    )}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const YOUTUBE_EMBED_BASE = 'https://www.youtube.com/embed/';

const buildYoutubeEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const directId = url.searchParams.get('v');
    if (directId) return `${YOUTUBE_EMBED_BASE}${directId}`;
    const pathname = url.pathname.split('/').filter(Boolean);
    const shortId = pathname[pathname.length - 1];
    if (shortId) return `${YOUTUBE_EMBED_BASE}${shortId}`;
    return null;
  } catch (error) {
    return null;
  }
};

const InfoPill = ({ label, value }) => (
  <MUI.Box display="flex" gap="2px">
    <MUI.Typography variant="caption" color="text.secondary">
      {label}
    </MUI.Typography>
    <MUI.Typography variant="body2">{value ?? '—'}</MUI.Typography>
  </MUI.Box>
);

const VideoModerationCard = ({
  video,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const [note, setNote] = useState('');
  const [deleteRemote, setDeleteRemote] = useState(false);

  const avatarLabel = useMemo(() => {
    if (!video?.contributor?.username) return '?';
    return video.contributor.username.slice(0, 2).toUpperCase();
  }, [video?.contributor?.username]);

  const uploadedAt = useMemo(
    () => video?.createdAt || video?.dateUploaded,
    [video?.createdAt, video?.dateUploaded]
  );

  const formattedDuration = useMemo(
    () => formatDuration(video?.duration),
    [video?.duration]
  );

  const youtubeEmbedUrl = useMemo(
    () => buildYoutubeEmbedUrl(video?.videoURL),
    [video?.videoURL]
  );

  const interactionLabels = useMemo(() => {
    const labels = [];
    if (video?.champion1 && video?.ability1) {
      labels.push(`${video.champion1} ${video.ability1}`);
    }
    if (video?.champion2 && video?.ability2) {
      labels.push(`${video.champion2} ${video.ability2}`);
    }
    return labels;
  }, [
    video?.ability1,
    video?.ability2,
    video?.champion1,
    video?.champion2,
  ]);

  const renderVideoPreview = useCallback(() => {
    if (!video) return null;
    if (video?.provider === 'youtube' && !video?.videoURL) {
      return (
        <MUI.Alert severity="info" variant="outlined">
          YouTube URL missing from submission.
        </MUI.Alert>
      );
    }
    if (video?.provider === 'mux' && !video?.playbackUrl) {
      return (
        <MUI.Alert severity="info" variant="outlined">
          Mux asset is currently {video?.status || 'processing'}.
          Playback will appear once the asset is ready.
        </MUI.Alert>
      );
    }
    return (
      <MUI.Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        zIndex={1000}
      >
        <MuxPlayer
          streamType="on-demand"
          src={video.playbackUrl}
          autoplay={false}
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', borderRadius: '10px', backgroundColor: 'black' }}
        />
      </MUI.Box>
    );
  }, [video, youtubeEmbedUrl]);

  const handleApprove = useCallback(() => {
    onApprove?.({ note });
  }, [note, onApprove]);

  const handleReject = useCallback(() => {
    onReject?.({ note, deleteRemote });
  }, [deleteRemote, note, onReject]);

  const deleteRemoteDisabled = video?.provider !== 'mux';

  useEffect(() => {
    if (deleteRemoteDisabled && deleteRemote) {
      setDeleteRemote(false);
    }
  }, [deleteRemoteDisabled, deleteRemote]);

  return (
    <MUI.Box
      display="flex"
      gap="10px"
      padding="24px"
      borderRadius="10px"
      border="1px solid #e0e0e0"
      bgcolor="black"
    >
      <MUI.Avatar sx={{ width: 48, height: 48 }}>
        {avatarLabel}
      </MUI.Avatar>
      <MUI.Box
        display="flex"
        gap="12px"
        flex={1}
      >
        {/*Video Description and Video*/}
        <MUI.Stack gap="2px" flex={1}>
          <MUI.Box display="flex" flexWrap="wrap" gap="8px" alignItems="center">
            <MUI.Typography>
              {video?.contributor?.username || 'Unknown contributor'}
            </MUI.Typography>
            <MUI.Typography variant="date_text" color="text.secondary">
              {formatDate(uploadedAt)}
            </MUI.Typography>
          </MUI.Box>

          <MUI.Typography variant="h6">
            {video?.title || 'Untitled video'}
          </MUI.Typography>

          <MUI.Box
            width="100%"
            position="relative"
            borderRadius="10px"
            overflow="hidden"
            bgcolor="black"
            sx={{ aspectRatio: '16/9' }}
          >
            <MUI.Chip
              label={video?.provider || 'unknown provider'}
              size="small"
              variant="outlined"
              color={video?.provider === 'mux' ? 'success' : 'warning'}
              sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1001 }}
            />
            {renderVideoPreview()}
          </MUI.Box>
        </MUI.Stack>
        <MUI.Stack justifyContent="space-between">
          {/* Video Information labels */}
          <MUI.Stack spacing={0.5}>
            <InfoPill label="Duration" value={formattedDuration} />
            <InfoPill
              label="Max resolution"
              value={video?.maxResolution || '—'}
            />
            <InfoPill
              label="Aspect ratio"
              value={video?.aspectRatio || '—'}
            />
          </MUI.Stack>
          <MUI.Stack spacing="2px">
            <MUI.Typography variant="body2">
              Notes to contributor
            </MUI.Typography>
            <MUI.TextField
              multiline
              minRows={3}
              placeholder="Optional notes or moderation context"
              fullWidth
              variant="outlined"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </MUI.Stack>
        </MUI.Stack>
        <MUI.Stack spacing={1.5}>
          <MUI.Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={handleApprove}
            disabled={isProcessing}
            sx={{ flex: 1 }}
          >
            Approve
          </MUI.Button>
          <MUI.Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleReject}
            disabled={isProcessing}
            sx={{ flex: 1 }}
          >
            Reject
          </MUI.Button>
        </MUI.Stack>
      </MUI.Box>
    </MUI.Box>
  );
};

export default VideoModerationCard;