import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  ThumbUpOutlined,
  ThumbUp,
  Reply as ReplyIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import { NeoButton } from '../design/NeoComponents';
import DeleteConfirmationDialog from '../design/DeleteConfirmationDialog';

// Neo-brutalist View Replies Button Component
const ViewRepliesButton = memo(({
  replyCount,
  showReplies,
  onToggleReplies,
  isLoadingReplies
}) => {
  if (replyCount === 0) return null;

  return (
    <NeoButton
      size="small"
      onClick={onToggleReplies}
      disabled={isLoadingReplies}
      startIcon={isLoadingReplies ? <MUI.CircularProgress size={12} thickness={6} /> : undefined}
      color={showReplies ? '#FFE082' : 'white'}
      sx={{
        '&:hover': {
          bgcolor: showReplies ? '#FFD54F' : '#F5F5F5',
        }
      }}
    >
      {isLoadingReplies
        ? 'Loading...'
        : `${showReplies ? 'Hide' : 'View'} ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
      }
    </NeoButton>
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
        <NeoButton
          size="small"
          onClick={handleLikeClick}
          disabled={!user || isDisabled}
          color={isLiked ? '#90CAF9' : 'white'}
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
            '&:hover': {
              bgcolor: isLiked ? '#64B5F6' : '#F5F5F5',
            }
          }}
        >
          {likeCount}
        </NeoButton>
        
        {/* Reply Button - Neo-Brutalist Style */}
        {!hideReplyButton && (
          <NeoButton
            size="small"
            onClick={handleReplyClick}
            disabled={!user || isDisabled || isSubmittingReply}
            startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
            color={isReplyingTo ? '#A5D6A7' : 'white'}
            sx={{
              '&:hover': {
                bgcolor: isReplyingTo ? '#81C784' : '#F5F5F5',
              }
            }}
          >
            Reply
          </NeoButton>
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
          <NeoButton
            size="small"
            onClick={handleDeleteClick}
            disabled={!user}
            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
            color="white"
            sx={{
              '&:hover': {
                bgcolor: '#FFCDD2',
              }
            }}
          >
            Delete
          </NeoButton>
        )}
      </MUI.Box>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemType={isReply ? 'Reply' : 'Comment'}
        warningMessage={!isReply && replyCount > 0 
          ? `Warning: This will also delete all ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}.`
          : null
        }
      />
    </>
  );
});

CommentActions.displayName = 'CommentActions';

export default CommentActions;
export { ViewRepliesButton }; 
