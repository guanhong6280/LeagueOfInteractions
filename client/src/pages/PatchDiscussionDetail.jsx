import React, { useState } from 'react';
import * as MUI from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ChatBubble as ChatBubbleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { NeoCard, NeoButton, NeoBadge } from '../common/rating_system/components/design/NeoComponents';
import DeleteConfirmationDialog from '../common/rating_system/components/design/DeleteConfirmationDialog';
import ReturnButton from '../common/rating_system/components/common/ReturnButton';
import { CommentList } from '../common/rating_system/components/comments';
import usePostData, { usePostById } from '../hooks/usePostData';
import usePostCommentData from '../hooks/usePostCommentData';
import { formatRelativeDateUpper } from '../utils/dateUtils';

const PatchDiscussionDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch post data
  const {
    post,
    isLoading: isLoadingPost,
    error: postError,
    isLiked,
  } = usePostById(postId);

  // Get like and delete functionality
  const { togglePostLike, deletePost } = usePostData({});

  // Fetch comments data
  const {
    comments,
    isLoading: isLoadingComments,
    isSubmitting,
    error: commentError,
    isRefreshing,
    expandedReplies,
    replyingTo,
    loadingReplies,
    submitComment,
    toggleCommentLike,
    toggleReplies,
    startReply,
    cancelReply,
    submitReply,
    deleteComment,
    deleteReply,
    refreshComments,
  } = usePostCommentData(postId);

  const handleDeletePost = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await deletePost(post.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);
    if (result.success) {
      navigate('/patch-discussion');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // Show loading state
  if (isLoadingPost) {
    return (
      <MUI.Box
        component="main"
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f0f0f0"
      >
        <MUI.CircularProgress size={60} sx={{ color: 'black' }} />
      </MUI.Box>
    );
  }

  // Show error state if post not found or error occurred
  if (!isLoadingPost && (!post || postError)) {
    return (
      <MUI.Box
        component="main"
        minHeight="100vh"
        py={4}
        px={{ xs: 2, sm: 3, md: 4 }}
        bgcolor="#f0f0f0"
      >
        <MUI.Box maxWidth="900px" mx="auto">
          <ReturnButton
            top={{ xs: 100, sm: 100 }}
            onClick={() => navigate('/patch-discussion')}
          />
          <NeoCard sx={{ textAlign: 'center', bgcolor: '#FFCDD2' }}>
            <MUI.Typography variant="h6" fontWeight="900" mb={2}>
              {postError ? 'ERROR LOADING POST' : 'POST NOT FOUND'}
            </MUI.Typography>
            <MUI.Typography fontFamily="monospace">
              {postError || 'This post may have been deleted or does not exist.'}
            </MUI.Typography>
          </NeoCard>
        </MUI.Box>
      </MUI.Box>
    );
  }

  return (
    <MUI.Box
      component="main"
      minHeight="100vh"
      py={4}
      px={{ xs: 2, sm: 3, md: 4 }}
      bgcolor="#f0f0f0"
    >
      <MUI.Box maxWidth="900px" mx="auto">
        {/* Back Button */}
        <ReturnButton
          top={{ xs: 110, sm: 110 }}
          left={{ xs: 100, sm: 100 }}
          onClick={() => navigate('/patch-discussion')}
        />

        {/* Post Content */}
        <NeoCard sx={{ mb: 3 }}>
          {/* Header */}
          <MUI.Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <MUI.Box display="flex" alignItems="center" gap={1}>
              <MUI.Box
                sx={{
                  bgcolor: '#FFEB3B',
                  border: '2px solid #000',
                  px: 1.5,
                  py: 0.5,
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  boxShadow: '2px 2px 0px #000',
                }}
              >
                PATCH {post.patchVersion}
              </MUI.Box>
              <MUI.Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: 'text.secondary',
                }}
              >
                {formatRelativeDateUpper(post.createdAt)}
              </MUI.Typography>
            </MUI.Box>

            {(post.capabilities?.canDelete || post.capabilities?.canEdit) && (
              <MUI.Box display="flex" gap={1}>
                {post.capabilities?.canEdit && (
                  <NeoButton
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert("Currently working on edit functionality");
                    }}
                    size="small"
                    color="white"
                    sx={{
                      '&:hover': {
                        bgcolor: '#64B5F6',
                      },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </NeoButton>
                )}
                {post.capabilities?.canDelete && (
                  <NeoButton
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    color="white"
                    size="small"
                    sx={{
                      '&:hover': {
                        bgcolor: '#E53935',
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </NeoButton>
                )}
              </MUI.Box>
            )}
          </MUI.Box>

          {/* Title */}
          <MUI.Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </MUI.Typography>

          {/* Badges */}
          {(post.selectedChampion || post.selectedGameMode) && (
            <MUI.Box mb={2} display="flex" flexWrap="wrap" gap={1}>
              {post.selectedChampion && (
                <NeoBadge label={post.selectedChampion} color="#A5D6A7" />
              )}
              {post.selectedGameMode && (
                <NeoBadge label={post.selectedGameMode} color="#80D8FF" />
              )}
            </MUI.Box>
          )}

          {/* Body */}
          <MUI.Typography
            variant="body1"
            sx={{
              mb: 3,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
            }}
          >
            {post.body}
          </MUI.Typography>

          {/* Divider */}
          <MUI.Box sx={{ height: '2px', bgcolor: 'black', mb: 2 }} />

          {/* Author and Stats */}
          <MUI.Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Author */}
            <MUI.Box display="flex" alignItems="center" gap={1.5}>
              {post.user?.profilePictureURL ? (
                <MUI.Avatar
                  src={post.user.profilePictureURL}
                  alt={post.user.username}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid #000',
                    borderRadius: 0,
                  }}
                />
              ) : (
                <MUI.Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid #000',
                    bgcolor: '#E0E0E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon />
                </MUI.Box>
              )}

              <MUI.Box>
                <MUI.Typography variant="body1" fontWeight="900">
                  {post.user?.username || 'Anonymous'}
                </MUI.Typography>
                {post.user?.rank && (
                  <MUI.Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {post.user.rank}
                  </MUI.Typography>
                )}
              </MUI.Box>
            </MUI.Box>

            {/* Stats Group */}
            <MUI.Box display="flex" gap={1}>
              {/* Like Button */}
              <NeoButton
                size="small"
                onClick={() => togglePostLike(post.id, isLiked)}
                color={isLiked ? '#90CAF9' : '#ffffff'}
                startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              >
                {post.likeCount || 0}
              </NeoButton>

              {/* Comment Count */}
              <NeoButton
                size="small"
                startIcon={<ChatBubbleIcon sx={{ fontSize: 16 }} />}
                color="white"
                sx={{
                  pointerEvents: 'none',
                  cursor: 'default',
                }}
              >
                {post.commentCount || 0}
              </NeoButton>
            </MUI.Box>
          </MUI.Box>
        </NeoCard>

        {/* Comments Section */}
        <NeoCard>
          <CommentList
            comments={comments}
            isLoading={isLoadingComments}
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
            error={commentError}
            onClearError={() => {}} // Error will be cleared on next successful query
            enableFloatingForm={true}
            onDeleteComment={deleteComment}
            onDeleteReply={deleteReply}
          />
        </NeoCard>

        {/* Delete Post Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemType="Post"
          itemName={post?.title}
          warningMessage={post?.commentCount > 0
            ? `Warning: This will also delete all ${post.commentCount} ${post.commentCount === 1 ? 'comment' : 'comments'} on this post.`
            : null
          }
          isDeleting={isDeleting}
        />
      </MUI.Box>
    </MUI.Box>
  );
};

export default PatchDiscussionDetail;
