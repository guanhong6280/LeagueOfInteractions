import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  ThumbUpOutlined,
  ThumbUp,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { useAuth } from '../../../../AuthProvider';

// Neo-brutalist View Replies Button Component
const ViewRepliesButton = memo(({ 
  replyCount, 
  showReplies, 
  onToggleReplies, 
  isLoadingReplies 
}) => {
  if (replyCount === 0) return null;

  return (
    <MUI.Button
      onClick={onToggleReplies}
      disabled={isLoadingReplies}
      startIcon={isLoadingReplies ? <MUI.CircularProgress size={12} thickness={6} /> : undefined}
      sx={{
        minWidth: 'auto',
        px: 1.5,
        py: 0.5,
        border: '2px solid black',
        borderRadius: 0,
        bgcolor: showReplies ? '#FFE082' : 'white',
        color: 'black',
        fontWeight: 900,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        boxShadow: '2px 2px 0px black',
        transition: 'all 0.1s ease-in-out',
        '&:hover': {
          bgcolor: showReplies ? '#FFD54F' : '#F5F5F5',
          transform: 'translate(-1px, -1px)',
          boxShadow: '3px 3px 0px black',
        },
        '&:active': {
          transform: 'translate(0, 0)',
          boxShadow: '1px 1px 0px black',
        },
        '&.Mui-disabled': {
          bgcolor: '#E0E0E0',
          color: '#9E9E9E',
          border: '2px solid #9E9E9E',
        },
      }}
    >
      {isLoadingReplies 
        ? 'Loading...' 
        : `${showReplies ? 'Hide' : 'View'} ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
      }
    </MUI.Button>
  );
});

ViewRepliesButton.displayName = 'ViewRepliesButton';

const CommentActions = memo(({
  comment,
  onToggleLike,
  onStartReply,
  isReplyingTo,
  onCancelReply,
  showReplies,
  onToggleReplies,
  isSubmittingReply,
  isLoadingReplies
}) => {
  const { user } = useAuth();
  const [likeAnimation, setLikeAnimation] = useState(false);

  const isLiked = user && comment.likedBy?.includes(user._id);
  const likeCount = comment.likedBy?.length || 0;
  const replyCount = comment.replyCount || 0;
  // Disable interactions for rejected or pending comments
  const isDisabled = comment.status === 'rejected' || comment.status === 'needsReview';

  const handleLikeClick = async () => {
    if (!user || isDisabled) return;

    // Trigger animation
    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 300);

    await onToggleLike(comment._id, isLiked);
  };

  const handleReplyClick = () => {
    if (!user || isDisabled) return;

    if (isReplyingTo) {
      onCancelReply();
    } else {
      onStartReply(comment._id);
    }
  };

  return (
    <MUI.Box display="flex" alignItems="center" gap={1}>
      {/* Like Button - Neo-Brutalist Style */}
      <MUI.Button
        onClick={handleLikeClick}
        disabled={!user || isDisabled}
        startIcon={
          isLiked ? (
            <ThumbUp
              sx={{
                fontSize: 16,
                transform: likeAnimation ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s ease-in-out',
              }}
            />
          ) : (
            <ThumbUpOutlined
              sx={{
                fontSize: 16,
                transform: likeAnimation ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          )
        }
        sx={{
          minWidth: 'auto',
          px: 1.5,
          py: 0.5,
          border: '2px solid black',
          borderRadius: 0,
          bgcolor: isLiked ? '#90CAF9' : 'white',
          color: 'black',
          fontWeight: 900,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          boxShadow: '2px 2px 0px black',
          transition: 'all 0.1s ease-in-out',
          '&:hover': {
            bgcolor: isLiked ? '#64B5F6' : '#F5F5F5',
            transform: 'translate(-1px, -1px)',
            boxShadow: '3px 3px 0px black',
          },
          '&:active': {
            transform: 'translate(0, 0)',
            boxShadow: '1px 1px 0px black',
          },
          '&.Mui-disabled': {
            bgcolor: '#E0E0E0',
            color: '#9E9E9E',
            border: '2px solid #9E9E9E',
          },
        }}
      >
        {likeCount > 0 && likeCount}
      </MUI.Button>
      
      {/* Reply Button - Neo-Brutalist Style */}
      <MUI.Button
        onClick={handleReplyClick}
        disabled={!user || isDisabled || isSubmittingReply}
        startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
        sx={{
          minWidth: 'auto',
          px: 1.5,
          py: 0.5,
          border: '2px solid black',
          borderRadius: 0,
          bgcolor: isReplyingTo ? '#A5D6A7' : 'white',
          color: 'black',
          fontWeight: 900,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          boxShadow: '2px 2px 0px black',
          transition: 'all 0.1s ease-in-out',
          '&:hover': {
            bgcolor: isReplyingTo ? '#81C784' : '#F5F5F5',
            transform: 'translate(-1px, -1px)',
            boxShadow: '3px 3px 0px black',
          },
          '&:active': {
            transform: 'translate(0, 0)',
            boxShadow: '1px 1px 0px black',
          },
          '&.Mui-disabled': {
            bgcolor: '#E0E0E0',
            color: '#9E9E9E',
            border: '2px solid #9E9E9E',
          },
        }}
      >
        Reply
      </MUI.Button>

      {/* View Replies Button - Extracted Component */}
      <ViewRepliesButton
        replyCount={replyCount}
        showReplies={showReplies}
        onToggleReplies={onToggleReplies}
        isLoadingReplies={isLoadingReplies}
      />
    </MUI.Box>
  );
});

CommentActions.displayName = 'CommentActions';

export default CommentActions;
export { ViewRepliesButton }; 