import React, { memo } from 'react';
import * as MUI from '@mui/material';
import useChampionCommentData from '../../hooks/useChampionCommentData';
import { CommentList } from '../comments';

const ChampionCommentSection = memo(({ championName }) => {
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
  } = useChampionCommentData(championName);

  return (
    <MUI.Box
      // No extra border/margin/padding here as it will be inside a container
      sx={{ width: '100%', mx: 'auto' }}
    >
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
        enableFloatingForm={false}
      />
    </MUI.Box>
  );
});

ChampionCommentSection.displayName = 'ChampionCommentSection';

export default ChampionCommentSection;

