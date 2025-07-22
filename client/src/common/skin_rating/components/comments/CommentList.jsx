import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import CommentListHeader from './CommentListHeader';
import CommentItems from './CommentItems';
import InlineCommentForm from './InlineCommentForm';

const CommentList = memo(({
  comments,
  isLoading,
  onToggleLike,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onToggleReplies,
  replyingTo,
  expandedReplies,
  isSubmittingReply,
  loadingReplies,
  onSubmitComment,
  onRefreshComments,
  error,
  onClearError
}) => {
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, mostLiked

  // Sort comments based on selected option
  const sortedComments = React.useMemo(() => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'mostLiked':
        return sorted.sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [comments, sortBy]);

  return (
    <MUI.Box marginX="10px">
      <CommentListHeader sortBy={sortBy} setSortBy={setSortBy} onRefreshComments={onRefreshComments} />
      <MUI.Box height="550px" overflow="auto">
        {isLoading ? (
          <MUI.Box display="flex" height="100%" justifyContent="center" alignItems="center">
            <MUI.Typography variant="body1" sx={{ ml: 2 }}>
              Loading comments...
            </MUI.Typography>
          </MUI.Box>
        ) : (
          <CommentItems
            comments={sortedComments}
            onToggleLike={onToggleLike}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            onSubmitReply={onSubmitReply}
            onToggleReplies={onToggleReplies}
            replyingTo={replyingTo}
            expandedReplies={expandedReplies}
            isSubmittingReply={isSubmittingReply}
            loadingReplies={loadingReplies}
          />
        )}
      </MUI.Box>
      {/* Load More Button (for future pagination) */}
      {!isLoading && sortedComments.length >= 10 && (
        <MUI.Box display="flex" justifyContent="center" mt={4}>
          <MUI.Button
            variant="outlined"
            size="large"
            sx={{ textTransform: 'none', px: 4, py: 1.5 }}
          >
            Load More Comments
          </MUI.Button>
        </MUI.Box>
      )}
      {/* Inline Comment Form */}
      <MUI.Box sx={{ mt: 4 }}>
        <InlineCommentForm
          onSubmit={onSubmitComment}
          isSubmitting={isSubmittingReply}
          error={error}
          onClearError={onClearError}
        />
      </MUI.Box>
    </MUI.Box>
  );
});

CommentList.displayName = 'CommentList';

export default CommentList; 