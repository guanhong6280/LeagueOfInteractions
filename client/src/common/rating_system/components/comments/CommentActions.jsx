import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  ThumbUpOutlined,
  ThumbUp,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { useAuth } from '../../../../AuthProvider';

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
    <MUI.Box display="flex" alignItems="center">
      {/* Like Button - TikTok Style */}
      <MUI.Button
        onClick={handleLikeClick}
        disabled={!user || isDisabled}
        size="small"
        startIcon={
          isLiked ? (
            <ThumbUp
              sx={{
                fontSize: 14,
                transform: likeAnimation ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s ease-in-out',
                color: 'primary.main'
              }}
            />
          ) : (
            <ThumbUpOutlined
              sx={{
                fontSize: 14,
                transform: likeAnimation ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          )
        }
        sx={{
          minWidth: 'auto',
          p: 0.5,
          color: isLiked ? 'primary.main' : 'text.secondary',
          fontSize: '0.75rem',
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'transparent',
            color: isLiked ? 'primary.dark' : 'primary.main',
          },
          '&.Mui-disabled': {
            color: 'action.disabled',
          },
        }}
      >
        {likeCount > 0 ? likeCount : ''}
      </MUI.Button>
      
      {/* Reply Button - TikTok Style */}
      <MUI.Button
        onClick={handleReplyClick}
        disabled={!user || isDisabled || isSubmittingReply}
        size="small"
        sx={{
          minWidth: 'auto',
          p: 0.5,
          color: isReplyingTo ? 'primary.main' : 'text.secondary',
          fontSize: '0.75rem',
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'transparent',
            color: 'primary.main',
          },
          '&.Mui-disabled': {
            color: 'action.disabled',
          },
        }}
      >
        <MUI.Box sx={{ display: 'flex', alignItems: 'center', columnGap: '1px' }}>
          <ReplyIcon sx={{ fontSize: 14, mb: '1px' }} />
          Reply
        </MUI.Box>
      </MUI.Button>

      {/* View Replies Button - TikTok Style */}
      {replyCount > 0 && (
        <MUI.Button
          onClick={onToggleReplies}
          disabled={isLoadingReplies}
          size="small"
          startIcon={isLoadingReplies ? <MUI.CircularProgress size={12} /> : undefined}
          sx={{
            minWidth: 'auto',
            p: 0.5,
            color: 'text.secondary',
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'transparent',
              color: 'primary.main',
            },
            '&.Mui-disabled': {
              color: 'action.disabled',
            },
          }}
        >
          {isLoadingReplies 
            ? 'Loading...' 
            : `${showReplies ? 'Hide' : 'View'} ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
          }
        </MUI.Button>
      )}
    </MUI.Box>
  );
});

CommentActions.displayName = 'CommentActions';

export default CommentActions; 