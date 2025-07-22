import React, { memo } from 'react';
import * as MUI from '@mui/material';
import {
  Warning as WarningIcon
} from '@mui/icons-material';
import CommentActions from './CommentActions';
import ReplyForm from './ReplyForm';

const CommentItem = memo(({
  comment,
  onToggleLike,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onToggleReplies,
  isReplyingTo,
  showReplies,
  isSubmittingReply,
  isLoadingReplies
}) => {
  const replyingToUsername = comment.user?.username || 'User';

  return (
    <MUI.Box
      sx={{
        py: 2,
        px: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          transition: 'background-color 0.2s ease-in-out',
        },
        '&:last-child': {
          borderBottom: 'none',
        }
      }}
    >
      {/* TikTok-style Comment Layout */}
      <MUI.Box display="flex" alignItems="flex-start" gap={1.5}>
        <MUI.Avatar
          src={comment.user?.profilePictureURL}
          alt={comment.user?.username}
          sx={{ width: 28, height: 28 }}
        >
          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
        </MUI.Avatar>

        <MUI.Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Username and Badges - Inline */}
          <MUI.Box display="flex" alignItems="center" gap={0.25} sx={{ mb: -0.5 }}>
            <MUI.Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.875rem', lineHeight: 1.2 }}>
              {comment.user?.username || 'Anonymous User'}
            </MUI.Typography>

            {/* Moderation Status - Inline */}
            {comment.status === 'needsReview' && (
              <MUI.Chip
                label="Under Review"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.6rem', ml: 0.5 }}
              />
            )}

            {comment.status === 'rejected' && (
              <MUI.Chip
                label="Rejected"
                size="small"
                color="error"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.6rem', ml: 0.5 }}
              />
            )}

            {comment.isEdited && (
              <MUI.Chip
                label="Edited"
                size="small"
                variant="outlined"
                sx={{
                  height: 16,
                  fontSize: '0.6rem',
                  ml: 0.5,
                  color: 'text.secondary',
                  borderColor: 'text.secondary'
                }}
              />
            )}
          </MUI.Box>
          {/* Time Ago - TikTok Style */}
          <MUI.Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
            {getTimeAgo(comment.createdAt)}
          </MUI.Typography>

          {/* Comment Content */}
          <MUI.Typography
            variant="body2"
            marginTop={0.5}
            sx={{
              mb: 1,
              lineHeight: 1.4,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem'
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
            isReplyingTo={isReplyingTo === comment._id}
            showReplies={showReplies}
            onToggleReplies={() => onToggleReplies(comment._id)}
            isSubmittingReply={isSubmittingReply}
            isLoadingReplies={isLoadingReplies}
          />
          <MUI.Divider sx={{ my: 1 }} />
        </MUI.Box>
      </MUI.Box>

      {/* Reply Form */}
      {isReplyingTo === comment._id && (
        <ReplyForm
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
          isSubmitting={isSubmittingReply}
          parentCommentId={comment._id}
          replyingToUsername={replyingToUsername}
        />
      )}

      {/* Replies List - TikTok Style */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <MUI.Collapse in={showReplies}>
          <MUI.Box sx={{ mt: 2, pl: 4 }}>
            {comment.replies.map((reply, index) => (
              <ReplyItem
                key={reply._id || index}
                reply={reply}
                onToggleLike={onToggleLike}
                isLast={index === comment.replies.length - 1}
              />
            ))}
            <MUI.Divider sx={{ my: 1 }} />
          </MUI.Box>
        </MUI.Collapse>
      )}
    </MUI.Box>
  );
});

// TikTok-style ReplyItem component
const ReplyItem = memo(({ reply, onToggleLike, isLast }) => {
  return (
    <MUI.Box sx={{ mb: isLast ? 0 : 1.5, py: 1 }}>
      <MUI.Box display="flex" alignItems="flex-start" gap={1}>
        <MUI.Avatar
          src={reply.user?.profilePictureURL}
          alt={reply.user?.username}
          sx={{ width: 24, height: 24 }}
        >
          {reply.user?.username?.charAt(0).toUpperCase() || 'U'}
        </MUI.Avatar>

        <MUI.Box sx={{ flex: 1 }}>
          {/* Reply Header - Inline */}
          <MUI.Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <MUI.Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
              {reply.user?.username || 'Anonymous User'}
            </MUI.Typography>

            {/* Reply Status - Inline */}
            {reply.status === 'needsReview' && (
              <MUI.Chip
                label="Under Review"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 14, fontSize: '0.55rem', ml: 0.5 }}
              />
            )}

            {reply.isEdited && (
              <MUI.Chip
                label="Edited"
                size="small"
                variant="outlined"
                sx={{
                  height: 14,
                  fontSize: '0.55rem',
                  ml: 0.5,
                  color: 'text.secondary',
                  borderColor: 'text.secondary'
                }}
              />
            )}
          </MUI.Box>

          {/* Reply Content */}
          <MUI.Typography
            variant="body2"
            sx={{
              mb: 0.5,
              lineHeight: 1.3,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              fontSize: '0.8rem'
            }}
          >
            {reply.displayText}
          </MUI.Typography>

          {/* Simple Reply Actions - TikTok style */}
          <MUI.Box display="flex" alignItems="center" gap={1}>
            <MUI.Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {new Date(reply.createdAt).toLocaleDateString()}
              {reply.isEdited && ' • edited'}
            </MUI.Typography>

            {reply.likedBy && reply.likedBy.length > 0 && (
              <MUI.Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                • {reply.likedBy.length} {reply.likedBy.length === 1 ? 'like' : 'likes'}
              </MUI.Typography>
            )}
          </MUI.Box>
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