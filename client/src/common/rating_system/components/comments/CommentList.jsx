import React, { memo, useState, useRef, useEffect } from 'react';
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
  isRefreshing = false,
  error,
  onClearError,
  enableFloatingForm = true
}) => {
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, mostLiked
  const [isFormFloating, setIsFormFloating] = useState(false);
  const formPlaceholderRef = useRef(null);

  useEffect(() => {
    if (!enableFloatingForm) return;

    const handleKeyDown = (event) => {
      // Toggle floating form on 'f' key press, but ignore if typing in an input or textarea
      if (
        (event.key === 'f' || event.key === 'F') && 
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        setIsFormFloating(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableFloatingForm]);

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

  // Find the comment being replied to (if any)
  const replyToComment = React.useMemo(() => {
    if (!replyingTo) return null;
    
    // Search through all comments and their replies
    for (const comment of comments) {
      if (comment._id === replyingTo) {
        return comment;
      }
      // Check replies too
      if (comment.replies) {
        const reply = comment.replies.find(r => r._id === replyingTo);
        if (reply) return reply;
      }
    }
    return null;
  }, [replyingTo, comments]);

  const replyToUsername = replyToComment?.user?.username || null;

  return (
    <>
      <MUI.Box marginX="10px">
        <CommentListHeader sortBy={sortBy} setSortBy={setSortBy} onRefreshComments={onRefreshComments} isRefreshing={isRefreshing} />
        <MUI.Box height="550px" overflow="auto">
          {isLoading ? (
            <MUI.Box display="flex" height="100%" justifyContent="center" alignItems="center">
              <MUI.CircularProgress size={40} />
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
        {/* Inline Comment Form - Original Position */}
        <MUI.Box ref={formPlaceholderRef} sx={{ mt: 4 }}>
          {!isFormFloating && (
            <InlineCommentForm
              onSubmit={replyingTo ? onSubmitReply : onSubmitComment}
              isSubmitting={isSubmittingReply}
              error={error}
              onClearError={onClearError}
              isReplyMode={!!replyingTo}
              replyToUsername={replyToUsername}
              parentCommentId={replyingTo}
              onCancel={onCancelReply}
              characterLimit={replyingTo ? 500 : 1000}
            />
          )}
        </MUI.Box>
      </MUI.Box>

      {/* Floating Comment Form - Appears when toggled via 'F' key */}
      {isFormFloating && (
        <MUI.Portal>
          <MUI.Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              width: 'calc(100% - 40px)',
              maxWidth: 600,
              animation: 'slideUp 0.3s ease-out',
              '@keyframes slideUp': {
                from: {
                  transform: 'translateX(-50%) translateY(100%)',
                  opacity: 0,
                },
                to: {
                  transform: 'translateX(-50%) translateY(0)',
                  opacity: 1,
                },
              },
            }}
          >
            <MUI.Paper
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 0,
                border: '3px solid black',
                boxShadow: '6px 6px 0px black',
                overflow: 'hidden',
              }}
            >
              <InlineCommentForm
                onSubmit={replyingTo ? onSubmitReply : onSubmitComment}
                isSubmitting={isSubmittingReply}
                error={error}
                onClearError={onClearError}
                isReplyMode={!!replyingTo}
                replyToUsername={replyToUsername}
                parentCommentId={replyingTo}
                onCancel={onCancelReply}
                characterLimit={replyingTo ? 500 : 1000}
              />
            </MUI.Paper>
          </MUI.Box>
        </MUI.Portal>
      )}
    </>
  );
});

CommentList.displayName = 'CommentList';

export default CommentList; 