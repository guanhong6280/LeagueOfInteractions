import React, { useCallback, useMemo, useState } from 'react';
import * as MUI from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import VideoModerationCard from '../components/moderation/VideoModerationCard';
import {
  approveVideoModeration,
  getVideoModerationQueue,
  rejectVideoModeration,
} from '../../api/moderationApi';

const VideoModeration = () => {
  const queryClient = useQueryClient();
  const [pendingActionId, setPendingActionId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['moderation', 'videos'],
    queryFn: getVideoModerationQueue,
    refetchOnWindowFocus: false,
  });

  const videos = useMemo(() => data ?? [], [data]);

  const removeVideoFromCache = useCallback(
    (videoId) => {
      queryClient.setQueryData(['moderation', 'videos'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((video) => video?._id !== videoId);
      });
    },
    [queryClient]
  );

  const handleMutationError = useCallback((mutationError, fallbackMessage) => {
    const serverMessage =
      mutationError?.response?.data?.message ||
      mutationError?.response?.data?.error ||
      mutationError?.message;
    setSnackbar({
      open: true,
      message: serverMessage || fallbackMessage,
      severity: 'error',
    });
  }, []);

  const approveMutation = useMutation({
    mutationFn: ({ videoId, note }) =>
      approveVideoModeration(videoId, { note }),
    onMutate: ({ videoId }) => {
      setPendingActionId(videoId);
    },
    onSuccess: (_, { videoId }) => {
      removeVideoFromCache(videoId);
      queryClient.invalidateQueries({ queryKey: ['moderation', 'videos'] });
      setSnackbar({
        open: true,
        message: 'Video approved and moved out of the queue.',
        severity: 'success',
      });
    },
    onError: (mutationError) =>
      handleMutationError(
        mutationError,
        'Failed to approve the video. Please try again.'
      ),
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ videoId, note, deleteRemote }) =>
      rejectVideoModeration(videoId, { note, deleteRemote }),
    onMutate: ({ videoId }) => {
      setPendingActionId(videoId);
    },
    onSuccess: (_, { videoId }) => {
      removeVideoFromCache(videoId);
      queryClient.invalidateQueries({ queryKey: ['moderation', 'videos'] });
      setSnackbar({
        open: true,
        message: 'Video rejected.',
        severity: 'info',
      });
    },
    onError: (mutationError) =>
      handleMutationError(
        mutationError,
        'Failed to reject the video. Please try again.'
      ),
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const handleApprove = useCallback(
    (videoId, { note }) => {
      approveMutation.mutate({ videoId, note: note || '' });
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (videoId, { note, deleteRemote }) => {
      rejectMutation.mutate({
        videoId,
        note: note || '',
        deleteRemote: !!deleteRemote,
      });
    },
    [rejectMutation]
  );

  const isMutating =
    approveMutation.isPending || rejectMutation.isPending;

  return (
    <>
      <MUI.Stack spacing={4}>
        <MUI.Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <MUI.Typography variant="title_text">
            Video Moderation
          </MUI.Typography>
          <MUI.Button
            variant="outlined"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </MUI.Button>
        </MUI.Stack>
        <MUI.Divider />

        {isError && (
          <MUI.Alert severity="error">
            {error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              'Failed to load the video moderation queue.'}
          </MUI.Alert>
        )}

        {isLoading ? (
          <MUI.Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={240}
          >
            <MUI.CircularProgress />
          </MUI.Box>
        ) : (
          <MUI.Stack spacing={3}>
            {videos.length === 0 && !isFetching && (
              <MUI.Alert severity="info">
                All caught up! There are no videos waiting for review.
              </MUI.Alert>
            )}

            {videos.map((video) => (
              <VideoModerationCard
                key={video._id}
                video={video}
                onApprove={(payload) => handleApprove(video._id, payload)}
                onReject={(payload) => handleReject(video._id, payload)}
                isProcessing={isMutating && pendingActionId === video._id}
              />
            ))}
          </MUI.Stack>
        )}
      </MUI.Stack>

      <MUI.Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MUI.Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MUI.Alert>
      </MUI.Snackbar>
    </>
  );
};

export default VideoModeration;