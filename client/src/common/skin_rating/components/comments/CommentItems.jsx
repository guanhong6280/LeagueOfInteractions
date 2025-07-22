import React, { memo } from 'react';
import * as MUI from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import CommentItem from './CommentItem';

const CommentItems = memo(({
  comments,
  onToggleLike,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onToggleReplies,
  replyingTo,
  expandedReplies,
  isSubmittingReply,
  loadingReplies
}) => {
  if (comments.length === 0) {
    return (
      <MUI.Box display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
        <MUI.Typography variant="h6" color="text.secondary" gutterBottom>
          No comments match your filter
        </MUI.Typography>
        <MUI.Typography variant="body2" color="text.secondary">
          Try adjusting your filter settings to see more comments.
        </MUI.Typography>
      </MUI.Box>
    );
  }
  return (
    <>
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          onToggleLike={onToggleLike}
          onStartReply={onStartReply}
          onCancelReply={onCancelReply}
          onSubmitReply={onSubmitReply}
          onToggleReplies={onToggleReplies}
          isReplyingTo={replyingTo}
          showReplies={expandedReplies.has(comment._id)}
          isSubmittingReply={isSubmittingReply}
          isLoadingReplies={loadingReplies.has(comment._id)}
        />
      ))}
    </>
  );
});

CommentItems.displayName = 'CommentItems';

export default CommentItems; 