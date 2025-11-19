import React, { useCallback, useMemo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import CommentModerationCard from '../components/moderation/CommentModerationCard';
import {
  approveCommentModeration,
  getCommentModerationQueue,
  rejectCommentModeration,
} from '../../api/moderationApi';

const CommentModeration = () => {
  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const currentType = tabIndex === 0 ? 'skin' : 'champion';

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const removeCommentFromCache = useCallback(
    (commentId) => {
      queryClient.setQueryData(['moderation', 'comments', currentType], (oldData) => {
        if (!oldData) return oldData;
        const nextPages = oldData.pages.map((page) => ({
          ...page,
          data: (page?.data || []).filter(
            (comment) => comment.commentId !== commentId
          ),
        }));

        return { ...oldData, pages: nextPages };
      });
    },
    [queryClient, currentType]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['moderation', 'comments', currentType],
    queryFn: ({ pageParam }) =>
      getCommentModerationQueue({ 
        cursor: pageParam, 
        type: currentType 
      }),
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor,
    refetchOnWindowFocus: false,
  });

  const comments = useMemo(
    () =>
      data?.pages?.flatMap((page) => (page?.data ? page.data : [])) ?? [],
    [data]
  );

  const thresholds = data?.pages?.[0]?.thresholds;

  const approveMutation = useMutation({
    mutationFn: ({ commentId }) =>
      approveCommentModeration(commentId, { note: '', type: currentType }),
    onMutate: ({ commentId }) => {
      setPendingActionId(commentId);
    },
    onSuccess: (_, { commentId }) => {
      removeCommentFromCache(commentId);
      setSnackbar({
        open: true,
        message: 'Comment approved successfully.',
        severity: 'success',
      });
      refetch();
    },
    onError: (mutationError) => {
      setSnackbar({
        open: true,
        message:
          mutationError?.response?.data?.error ||
          'Failed to approve comment. Please try again.',
        severity: 'error',
      });
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ commentId }) =>
      rejectCommentModeration(commentId, { note: '', type: currentType }),
    onMutate: ({ commentId }) => {
      setPendingActionId(commentId);
    },
    onSuccess: (_, { commentId }) => {
      removeCommentFromCache(commentId);
      setSnackbar({
        open: true,
        message: 'Comment rejected.',
        severity: 'info',
      });
      refetch();
    },
    onError: (mutationError) => {
      setSnackbar({
        open: true,
        message:
          mutationError?.response?.data?.error ||
          'Failed to reject comment. Please try again.',
        severity: 'error',
      });
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const handleApprove = useCallback(
    (commentId) => {
      approveMutation.mutate({ commentId });
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (commentId) => {
      rejectMutation.mutate({ commentId });
    },
    [rejectMutation]
  );

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <>
      <MUI.Stack spacing={4}>
        <MUI.Stack spacing={1}>
          <MUI.Typography variant="title_text">
            Comment Moderation
          </MUI.Typography>
          <MUI.Divider />
        </MUI.Stack>

        <MUI.Tabs value={tabIndex} onChange={handleTabChange} aria-label="moderation tabs">
          <MUI.Tab label="Skin Comments" />
          <MUI.Tab label="Champion Comments" />
        </MUI.Tabs>

        {isError && (
          <MUI.Alert severity="error">
            {error?.response?.data?.error ||
              error?.message ||
              'Failed to load moderation queue.'}
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
            {comments.length === 0 && !isFetching && (
              <MUI.Alert severity="info">
                All caught up! There are no {currentType} comments waiting for review.
              </MUI.Alert>
            )}

            {comments.map((comment) => (
              <CommentModerationCard
                key={comment.commentId}
                comment={comment}
                subjectType={currentType}
                skin={currentType === 'skin' ? comment.skin : undefined}
                champion={currentType === 'champion' ? comment.champion : undefined}
                thresholds={thresholds}
                onApprove={() => handleApprove(comment.commentId)}
                onReject={() => handleReject(comment.commentId)}
                isProcessing={
                  isMutating && pendingActionId === comment.commentId
                }
              />
            ))}

            {hasNextPage && (
              <MUI.Box display="flex" justifyContent="center">
                <MUI.Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outlined"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </MUI.Button>
              </MUI.Box>
            )}
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

export default CommentModeration;
