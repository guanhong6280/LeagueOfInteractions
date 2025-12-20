import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  ThumbUpOutlined,
  ThumbUp,
  Reply as ReplyIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import useCurrentUser from '../../../../hooks/useCurrentUser';

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
  isLoadingReplies,
  onDeleteComment,
  hideReplyButton = false,
  hideViewRepliesButton = false,
  isReply = false
}) => {
  const { user } = useCurrentUser();
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isLiked = user && comment.likedBy?.includes(user.id);

  const likeCount = comment.likedBy?.length || 0;
  const replyCount = comment.replyCount || 0;
  // Disable interactions for rejected or pending comments
  const isDisabled = comment.status === 'rejected' || comment.status === 'needsReview';
  // Check if current user is the comment author
  const canDelete = comment.capabilities?.canDelete || false;

  const handleLikeClick = async () => {
    if (!user || isDisabled) return;

    // Trigger animation
    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 300);

    await onToggleLike(comment.id, isLiked);
  };

  const handleReplyClick = () => {
    if (!user || isDisabled) return;

    if (isReplyingTo) {
      onCancelReply();
    } else {
      onStartReply(comment.id);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    if (onDeleteComment) {
      await onDeleteComment(comment.id);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
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
        {likeCount}
      </MUI.Button>
        
      {/* Reply Button - Neo-Brutalist Style */}
      {!hideReplyButton && (
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
      )}

      {/* View Replies Button - Extracted Component */}
      {!hideViewRepliesButton && (
        <ViewRepliesButton
          replyCount={replyCount}
          showReplies={showReplies}
          onToggleReplies={onToggleReplies}
          isLoadingReplies={isLoadingReplies}
        />
      )}

        {/* Spacer to push delete button to the right */}
        <MUI.Box sx={{ flex: 1 }} />

        {/* Delete Button - Only show for comment author */}
        {canDelete && (
          <MUI.Button
            onClick={handleDeleteClick}
            disabled={!user}
            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              border: '2px solid black',
              borderRadius: 0,
              bgcolor: 'white',
              color: 'black',
              fontWeight: 900,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0px black',
              transition: 'all 0.1s ease-in-out',
              '&:hover': {
                bgcolor: '#FFCDD2',
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
            Delete
          </MUI.Button>
        )}
      </MUI.Box>

      {/* Delete Confirmation Dialog - Neo-Brutalist Style */}
      <MUI.Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '3px solid black',
            boxShadow: '8px 8px 0px black',
            minWidth: 400,
          }
        }}
      >
        <MUI.DialogTitle sx={{ fontWeight: 900, textTransform: 'uppercase', borderBottom: '2px solid black' }}>
          Delete {isReply ? 'Reply' : 'Comment'}?
        </MUI.DialogTitle>
        <MUI.DialogContent sx={{ mt: 2 }}>
          <MUI.Typography variant="body1" fontWeight="bold">
            Are you sure you want to delete this {isReply ? 'reply' : 'comment'}? This action cannot be undone.
          </MUI.Typography>
          {!isReply && replyCount > 0 && (
            <MUI.Typography variant="body2" fontWeight="bold" color="error.main" sx={{ mt: 2 }}>
              Warning: This will also delete all {replyCount} {replyCount === 1 ? 'reply' : 'replies'}.
            </MUI.Typography>
          )}
        </MUI.DialogContent>
        <MUI.DialogActions sx={{ p: 2, gap: 1 }}>
          <MUI.Button
            onClick={handleCancelDelete}
            sx={{
              textTransform: 'uppercase',
              fontWeight: 900,
              borderRadius: 0,
              border: '2px solid black',
              color: 'black',
              bgcolor: 'white',
              boxShadow: '4px 4px 0px black',
              '&:hover': {
                bgcolor: '#f0f0f0',
                transform: 'translate(-2px, -2px)',
                boxShadow: '6px 6px 0px black',
              },
              '&:active': {
                transform: 'translate(0, 0)',
                boxShadow: 'none',
              },
              transition: 'all 0.1s'
            }}
          >
            Cancel
          </MUI.Button>
          <MUI.Button
            onClick={handleConfirmDelete}
            sx={{
              textTransform: 'uppercase',
              fontWeight: 900,
              borderRadius: 0,
              border: '2px solid black',
              color: 'white',
              bgcolor: '#EF5350',
              boxShadow: '4px 4px 0px black',
              '&:hover': {
                bgcolor: '#E53935',
                transform: 'translate(-2px, -2px)',
                boxShadow: '6px 6px 0px black',
              },
              '&:active': {
                transform: 'translate(0, 0)',
                boxShadow: 'none',
              },
              transition: 'all 0.1s'
            }}
          >
            Delete
          </MUI.Button>
        </MUI.DialogActions>
      </MUI.Dialog>
    </>
  );
});

CommentActions.displayName = 'CommentActions';

export default CommentActions;
export { ViewRepliesButton }; 