import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  Reply as ReplyIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import { NeoButton } from '../design/NeoComponents';
import LikeButton from '../../../button/LikeButton';
import DeleteConfirmationDialog from '../design/DeleteConfirmationDialog';
import theme from '../../../../theme/theme';

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
      color={showReplies ? theme.palette.button.view_replies_button : 'white'}
      sx={{
        '&:hover': {
          bgcolor: showReplies ? theme.palette.button.view_replies_button_hover : theme.palette.button.view_replies_button
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
        <LikeButton
          isLiked={isLiked}
          likeCount={likeCount}
          onClick={handleLikeClick}
          disabled={!user || isDisabled}
        />
        
        {/* Reply Button - Neo-Brutalist Style */}
        {!hideReplyButton && (
          <NeoButton
            size="small"
            onClick={handleReplyClick}
            disabled={!user || isDisabled || isSubmittingReply}
            startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
            color={isReplyingTo ? theme.palette.button.reply_button : 'white'}
            sx={{
              '&:hover': {
                bgcolor: isReplyingTo ? theme.palette.button.reply_button_hover : theme.palette.button.reply_button,
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
                bgcolor: theme.palette.button.delete_button_hover,
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
