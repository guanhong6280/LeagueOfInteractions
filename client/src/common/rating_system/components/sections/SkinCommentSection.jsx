import React, { memo } from 'react';
import * as MUI from '@mui/material';
import useSkinCommentData from '../../hooks/useSkinCommentData';
import { CommentList } from '../comments';

const SkinCommentSection = memo(({ currentSkinId, championName }) => {
  const {
    // Data
    comments,
    userComment,

    // Loading states
    isLoading,
    isSubmitting,
    isRefreshing,
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
  } = useSkinCommentData(currentSkinId);

  return (
    <MUI.Box
      sx={{ width: '100%', mx: 'auto' }}
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
        isRefreshing={isRefreshing}
        error={error}
        onClearError={clearError}
      />
    </MUI.Box>
  );
});

SkinCommentSection.displayName = 'SkinCommentSection';

export default SkinCommentSection; 