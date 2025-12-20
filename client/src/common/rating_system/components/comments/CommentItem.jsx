import React, { memo } from 'react';
import * as MUI from '@mui/material';
import CommentActions from './CommentActions';

const CommentItem = memo(({
  comment,
  onToggleLike,
  onStartReply,
  onCancelReply,
  onToggleReplies,
  isReplyingTo,
  showReplies,
  isSubmittingReply,
  isLoadingReplies,
  onDeleteComment,
  onDeleteReply
}) => {
  return (
    <MUI.Box
      sx={{
        py: 2,
        px: 2,
        mb: 2,
        bgcolor: 'white',
        border: '3px solid black',
        boxShadow: '6px 6px 0px black',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '8px 8px 0px black',
        },
      }}
    >
      {/* TikTok-style Comment Layout */}
      <MUI.Box display="flex" alignItems="flex-start" gap={2}>
        <MUI.Avatar
          src={comment.user?.profilePictureURL}
          alt={comment.user?.username}
          sx={{
            width: 40,
            height: 40,
            border: '2px solid black',
            bgcolor: '#E0E0E0',
            color: 'black',
            fontWeight: 'bold'
          }}
        >
          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
        </MUI.Avatar>

        <MUI.Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Username and Badges - Inline */}
          <MUI.Box display="flex" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
            <MUI.Typography variant="subtitle2" fontWeight="900" sx={{ fontSize: '1rem', lineHeight: 1.2 }}>
              {comment.user?.username || 'Anonymous User'}
            </MUI.Typography>

            {/* Moderation Status - Inline */}
            {comment.status === 'needsReview' && (
              <MUI.Chip
                label="Under Review"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  borderRadius: 0,
                  border: '1px solid black',
                  bgcolor: '#FFF59D',
                  color: 'black'
                }}
              />
            )}

            {comment.status === 'rejected' && (
              <MUI.Chip
                label="Rejected"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  borderRadius: 0,
                  border: '1px solid black',
                  bgcolor: '#EF9A9A',
                  color: 'black'
                }}
              />
            )}

            {comment.isEdited && (
              <MUI.Chip
                label="Edited"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  borderRadius: 0,
                  border: '1px solid black',
                  bgcolor: '#E0E0E0',
                  color: 'black'
                }}
              />
            )}

            <MUI.Typography variant="caption" fontWeight="bold" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              • {getTimeAgo(comment.createdAt)}
            </MUI.Typography>
          </MUI.Box>

          {/* Comment Content */}
          <MUI.Typography
            variant="body1"
            sx={{
              mb: 1.5,
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'black'
            }}
          >
            {comment.displayText}
          </MUI.Typography>

          {/* TikTok-style Actions */}
          <CommentActions
            comment={comment}
            onToggleLike={onToggleLike}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            isReplyingTo={isReplyingTo === comment.id}
            showReplies={showReplies}
            onToggleReplies={() => onToggleReplies(comment.id)}
            isSubmittingReply={isSubmittingReply}
            isLoadingReplies={isLoadingReplies}
            onDeleteComment={onDeleteComment}
          />

          {showReplies && <MUI.Divider sx={{ my: 2, borderColor: 'black', borderBottomWidth: 2 }} />}
        </MUI.Box>
      </MUI.Box>

      {/* Replies List - TikTok Style */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <MUI.Collapse in={showReplies}>
          <MUI.Box sx={{ mt: 1, pl: { xs: 0, sm: 7 } }}>
            {comment.replies.map((reply, index) => (
              <ReplyItem
                key={reply.id || index}
                reply={reply}
                commentId={comment.id}
                onToggleLike={onToggleLike} 
                onDeleteReply={onDeleteReply}
                isLast={index === comment.replies.length - 1}
              />
            ))}
          </MUI.Box>
        </MUI.Collapse>
      )}
    </MUI.Box>
  );
});

// TikTok-style ReplyItem component - Now uses CommentActions for consistency
const ReplyItem = memo(({ reply, commentId, onToggleLike, onDeleteReply, isLast }) => {
  // Wrapper function to adapt the delete handler to match CommentActions signature
  const handleDeleteReply = async (replyId) => {
    if (onDeleteReply) {
      await onDeleteReply(commentId, replyId);
    }
  };

  return (
    <MUI.Box
      sx={{
        py: 2,
        px: 2,
        mb: 2,
        bgcolor: '#F5F5F5',
        border: '2px solid black',
        boxShadow: '4px 4px 0px black',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateX(2px)',
        },
      }}
    >
      <MUI.Box display="flex" alignItems="flex-start" gap={1.5}>
        {/* User Avatar */}
        <MUI.Avatar
          src={reply.user?.profilePictureURL}
          alt={reply.user?.username}
          sx={{
            width: 32,
            height: 32,
            border: '2px solid black',
            bgcolor: 'white',
            color: 'black',
            fontWeight: 'bold'
          }}
        >
          {reply.user?.username?.charAt(0).toUpperCase() || 'U'}
        </MUI.Avatar>

        {/* Reply Content */}
        <MUI.Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header: Username + Status Badges + Time */}
          <MUI.Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
            <MUI.Typography variant="subtitle2" fontWeight="900" sx={{ fontSize: '0.9rem' }}>
              {reply.user?.username || 'Anonymous User'}
            </MUI.Typography>

            {/* Status Badges */}
            {reply.status === 'needsReview' && (
              <MUI.Chip
                label="Under Review"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  borderRadius: 0,
                  border: '1px solid black',
                  bgcolor: '#FFF59D',
                  color: 'black'
                }}
              />
            )}

            {reply.isEdited && (
              <MUI.Chip
                label="Edited"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  borderRadius: 0,
                  border: '1px solid black',
                  bgcolor: '#E0E0E0',
                  color: 'black'
                }}
              />
            )}

            <MUI.Typography variant="caption" fontWeight="bold" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              • {getTimeAgo(reply.createdAt)}
            </MUI.Typography>
          </MUI.Box>

          {/* Reply Text */}
          <MUI.Typography
            variant="body2"
            sx={{
              mb: 1.5,
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'black'
            }}
          >
            {reply.displayText}
          </MUI.Typography>

          {/* Actions using CommentActions component */}
          <CommentActions
            comment={reply}
            onToggleLike={onToggleLike}
            onDeleteComment={handleDeleteReply}
            hideReplyButton={true}
            hideViewRepliesButton={true}
            isReply={true}
          />
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
});

const getTimeAgo = (dateString) => {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - commentDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return commentDate.toLocaleDateString();
  }
};

CommentItem.displayName = 'CommentItem';
ReplyItem.displayName = 'ReplyItem';

export default CommentItem; 