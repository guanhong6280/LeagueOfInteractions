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
  error,
  onClearError
}) => {
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, mostLiked
  const [isFormFloating, setIsFormFloating] = useState(false);
  const formPlaceholderRef = useRef(null);

  // Scroll listener to detect bottom of page and skin carousel section
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Check if user hit the bottom of the page (with small threshold)
      const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;
      
      // Check if user scrolled back up to skin carousel area
      // Assuming skin carousel is in the upper portion of the page
      const skinCarouselThreshold = windowHeight * 0.6; // Adjust this based on your layout
      const isBackToCarousel = scrollTop < skinCarouselThreshold;
      
      // Float form when at bottom, hide when back to carousel area
      if (isAtBottom && !isBackToCarousel) {
        setIsFormFloating(true);
      } else if (isBackToCarousel) {
        setIsFormFloating(false);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <>
      <MUI.Box marginX="10px">
        <CommentListHeader sortBy={sortBy} setSortBy={setSortBy} onRefreshComments={onRefreshComments} />
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
              onSubmit={onSubmitComment}
              isSubmitting={isSubmittingReply}
              error={error}
              onClearError={onClearError}
            />
          )}
        </MUI.Box>
      </MUI.Box>

      {/* Floating Comment Form - Appears when at bottom of page */}
      {isFormFloating && (
        <MUI.Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            width: 'calc(100% - 40px)',
            maxWidth: 600,
            transition: 'all 0.3s ease-in-out',
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
            elevation={8}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              overflow: 'hidden',
            }}
          >
            <InlineCommentForm
              onSubmit={onSubmitComment}
              isSubmitting={isSubmittingReply}
              error={error}
              onClearError={onClearError}
            />
          </MUI.Paper>
        </MUI.Box>
      )}
    </>
  );
});

CommentList.displayName = 'CommentList';

export default CommentList; 