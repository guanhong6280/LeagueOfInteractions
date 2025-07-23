import React, { memo } from 'react';
import * as MUI from '@mui/material';
import useCommentData from '../../hooks/useCommentData';
import { CommentList } from '../comments';

const SkinCommentSection = memo(({ currentSkinId, championName }) => {
  const {
    // Data
    comments,
    userComment,

    // Loading states
    isLoading,
    isSubmitting,
    error,

    // UI state
    expandedReplies,
    replyingTo,
    loadingReplies,

    // Actions
    submitComment,
    toggleCommentLike,
    toggleReplies,
    startReply,
    cancelReply,
    submitReply,
    clearError,
    refreshComments,
  } = useCommentData(currentSkinId);

  return (
    <MUI.Box
      border='2px solid'
      borderColor='divider'
      borderRadius='10px'
      paddingY='10px'
      marginBottom='80px'
      sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}
    >

      {/* Comments List */}
      <CommentList
        comments={comments}
        isLoading={isLoading}
        onToggleLike={toggleCommentLike}
        onStartReply={startReply}
        onCancelReply={cancelReply}
        onSubmitReply={submitReply}
        onToggleReplies={toggleReplies}
        replyingTo={replyingTo}
        expandedReplies={expandedReplies}
        isSubmittingReply={isSubmitting}
        loadingReplies={loadingReplies}
        onSubmitComment={submitComment}
        onRefreshComments={refreshComments}
        error={error}
        onClearError={clearError}
      />
    </MUI.Box>
  );
});

SkinCommentSection.displayName = 'SkinCommentSection';

export default SkinCommentSection; 