import React from 'react';
import * as MUI from '@mui/material';
import PostModerationCard from '../components/moderation/PostModerationCard';
import MinimalAlert from '../components/moderation/common/MinimalAlert';
import usePostModeration from '../hooks/usePostModeration';

const PostModeration = () => {
  const {
    posts,
    thresholds,
    pendingActionId,
    snackbar,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    isMutating,
    hasNextPage,
    fetchNextPage,
    handleApprove,
    handleReject,
    refetch,
    closeSnackbar,
  } = usePostModeration();

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
            Post Moderation
          </MUI.Typography>
          <MUI.Button
            variant="contained"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            sx={{
              backgroundColor: '#000000',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1a1a1a',
              },
            }}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </MUI.Button>
        </MUI.Stack>
        <MUI.Divider />

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
            {posts.length === 0 && !isFetching && (
              <MinimalAlert severity="info">
                All caught up! There are no posts waiting for review.
              </MinimalAlert>
            )}

            {posts.map((post) => (
              <PostModerationCard
                key={post.postId}
                post={post}
                thresholds={thresholds}
                onApprove={() => handleApprove(post.postId)}
                onReject={() => handleReject(post.postId)}
                isProcessing={isMutating && pendingActionId === post.postId}
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

export default PostModeration;
