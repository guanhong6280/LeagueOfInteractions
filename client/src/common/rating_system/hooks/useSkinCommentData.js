import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSkinComments,
  getUserSkinComment,
  submitSkinComment,
  likeComment,
  unlikeComment,
  addReply,
  getRepliesForComment,
} from '../../../api/championApi';
import { useAuth } from '../../../AuthProvider';

// Query key factory to prevent typos and centralize key management
const queryKeys = {
  comments: (skinId) => ['skin-comments', skinId],
  userComment: (skinId, userId) => ['user-skin-comment', skinId, userId],
};

// Configuration constants
const COMMENT_MAX_LENGTH = 1000;
const REPLY_MAX_LENGTH = 500;

const useCommentData = (currentSkinId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // UI state
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(new Set());

  // ==================== QUERIES ====================
  
  // 1. Fetch comments (inherits global React Query config from QueryProvider)
  const {
    data: comments = [],
    isLoading,
    error: commentsError,
    refetch: refreshComments
  } = useQuery({
    queryKey: queryKeys.comments(currentSkinId),
    queryFn: async () => {
      const response = await getSkinComments(currentSkinId, true);
      console.log('response', response);
      return response.success ? response.data : [];
    },
    enabled: !!currentSkinId,
  });

  // Transform comments only when needed (add displayText for backward compatibility)
  const transformedComments = useMemo(() => {
    return comments.map(comment => ({
      ...comment,
      displayText: comment.comment, // Backward compatibility
    }));
  }, [comments]);

  // 2. Fetch user's comment (inherits global React Query config)
  const { data: userComment } = useQuery({
    queryKey: queryKeys.userComment(currentSkinId, user?._id),
    queryFn: async () => {
      const response = await getUserSkinComment(currentSkinId);
      return response.success ? response.data : null;
    },
    enabled: !!currentSkinId && !!user,
  });

  // ==================== MUTATIONS ====================

  // Helper function to create optimistic user data
  const createOptimisticUser = useCallback(() => ({
    _id: user._id,
    username: user.username,
    profilePictureURL: user.profilePictureURL,
  }), [user]);

  // 3. Submit/Update Comment Mutation
  const submitCommentMutation = useMutation({
    mutationFn: (commentText) => submitSkinComment(currentSkinId, { comment: commentText.trim() }),

    onMutate: async (commentText) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));

      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        comment: commentText.trim(),
        userId: user._id,
        username: user.username,
        user: createOptimisticUser(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved',
        displayText: commentText.trim(),
        skinId: currentSkinId
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) => {
        const existingIndex = oldData.findIndex(c => c.userId === user._id);
        const isUpdate = existingIndex !== -1;

        if (isUpdate) {
          // Update existing comment
          const newList = [...oldData];
          newList[existingIndex] = {
            ...oldData[existingIndex],
            ...optimisticComment,
            _id: oldData[existingIndex]._id,
            createdAt: oldData[existingIndex].createdAt,
            isEdited: true
          };
          return newList;
        } else {
          // Prepend new comment
          return [optimisticComment, ...oldData];
        }
      });

      return { previousComments };
    },

    onSuccess: (response, variables, context) => {
      if (!response?.success || !response?.data) return;

      const submittedComment = response.data;

      // Replace optimistic with real data
      const commentForList = {
        ...submittedComment,
        displayText: submittedComment.comment,
        user: createOptimisticUser()
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) => {
        let foundTemp = false;
        const updatedComments = oldData.map(comment => {
          if (comment._id.startsWith('temp-')) {
            foundTemp = true;
            return commentForList;
          }
          if (comment._id === commentForList._id) {
            return commentForList;
          }
          return comment;
        });

        // Handle edge case: temp comment missing
        if (!foundTemp && !oldData.some(c => c._id === commentForList._id)) {
          return [commentForList, ...updatedComments];
        }

        return updatedComments;
      });
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(currentSkinId) });
      }
    }
  });

  // Wrapper function with validation
  const submitComment = useCallback(async (commentText) => {
    if (!user) {
      return { success: false, message: 'Please sign in to comment' };
    }

    const trimmedText = commentText.trim();
    if (!trimmedText) {
      return { success: false, message: 'Comment cannot be empty' };
    }

    if (trimmedText.length > COMMENT_MAX_LENGTH) {
      return { success: false, message: `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters` };
    }

    try {
      const result = await submitCommentMutation.mutateAsync(commentText);

      if (!result.success) {
        return { success: false, message: result.message || 'Failed to submit comment' };
      }

      const submittedComment = result.data;

      if (submittedComment.status === 'rejected') {
        return {
          success: false,
          message: 'Your comment was rejected due to inappropriate content. Please revise and try again.',
          status: 'rejected'
        };
      }

      const successMessage = submittedComment.status === 'needsReview'
        ? 'Your comment will be reviewed before being displayed.'
        : userComment ? 'Comment updated successfully.' : 'Comment submitted successfully.';

      return {
        success: true,
        message: successMessage,
        status: submittedComment.status
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit comment';
      return { success: false, message: errorMessage };
    }
  }, [user, submitCommentMutation, userComment, createOptimisticUser]);

  // 4. Like/Unlike Comment Mutation
  const toggleCommentLikeMutation = useMutation({
    mutationFn: ({ commentId, isCurrentlyLiked }) =>
      isCurrentlyLiked
        ? unlikeComment(currentSkinId, commentId)
        : likeComment(currentSkinId, commentId),

    onMutate: async ({ commentId, isCurrentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.map(comment =>
          comment._id === commentId
            ? {
              ...comment,
              likedBy: isCurrentlyLiked
                ? comment.likedBy.filter(id => id !== user._id)
                : [...comment.likedBy, user._id]
            }
            : comment
        )
      );

      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      }
    }
  });

  const toggleCommentLike = useCallback(async (commentId, isCurrentlyLiked) => {
    if (!user) return;

    try {
      await toggleCommentLikeMutation.mutateAsync({ commentId, isCurrentlyLiked });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }, [user, toggleCommentLikeMutation]);

  // ==================== REPLIES ====================

  // Load replies (optimized to not depend on comments array)
  const loadReplies = useCallback(async (commentId) => {
    // Check cache directly to avoid dependency on comments
    const currentComments = queryClient.getQueryData(queryKeys.comments(currentSkinId)) || [];
    const comment = currentComments.find(c => c._id === commentId);

    // Skip if already loading or loaded
    if (loadingReplies.has(commentId) || (comment?.replies && comment.replies.length > 0)) {
      return;
    }

    setLoadingReplies(prev => new Set([...prev, commentId]));

    try {
      const response = await getRepliesForComment(currentSkinId, commentId, true);
      if (response.success) {
        const transformedReplies = response.data.map(reply => ({
          ...reply,
          displayText: reply.comment,
        }));

        queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
          oldData.map(comment => {
            if (comment._id !== commentId) return comment;

            // Preserve temp replies
            const existingReplies = comment.replies || [];
            const tempReplies = existingReplies.filter(r => r._id.startsWith('temp-reply-'));
            
            // Merge with server data, avoiding duplicates
            const mergedReplies = [...transformedReplies];
            tempReplies.forEach(temp => {
              if (!mergedReplies.some(r => r._id === temp._id)) {
                mergedReplies.push(temp);
              }
            });

            return { ...comment, replies: mergedReplies };
          })
        );
      }
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  }, [currentSkinId, loadingReplies, queryClient]);

  // Toggle reply expansion
  const toggleReplies = useCallback(async (commentId) => {
    const isCurrentlyExpanded = expandedReplies.has(commentId);

    if (isCurrentlyExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Check if replies need to be loaded
      const currentComments = queryClient.getQueryData(queryKeys.comments(currentSkinId)) || [];
      const comment = currentComments.find(c => c._id === commentId);

      if (!comment?.replies || comment.replies.length === 0) {
        await loadReplies(commentId);
      }

      setExpandedReplies(prev => new Set([...prev, commentId]));
    }
  }, [expandedReplies, currentSkinId, loadReplies, queryClient]);

  // Start/stop replying
  const startReply = useCallback((commentId) => {
    setReplyingTo(commentId);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // 5. Submit Reply Mutation
  const submitReplyMutation = useMutation({
    mutationFn: ({ commentId, replyText }) =>
      addReply(currentSkinId, commentId, { comment: replyText.trim() }),

    onMutate: async ({ commentId, replyText }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));

      const optimisticReply = {
        _id: `temp-reply-${Date.now()}`,
        userId: user._id,
        username: user.username,
        comment: replyText.trim(),
        createdAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved',
        displayText: replyText.trim(),
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.map(comment =>
          comment._id === commentId
            ? { ...comment, replies: [...(comment.replies || []), optimisticReply] }
            : comment
        )
      );

      return { previousComments };
    },

    onSuccess: (response, { commentId }) => {
      if (!response?.success) return;

      const newReply = {
        ...response.data,
        displayText: response.data.comment,
        user: createOptimisticUser()
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.map(comment => {
          if (comment._id !== commentId) return comment;

          const existingReplies = comment.replies || [];
          let foundTemp = false;
          
          const updatedReplies = existingReplies.map(reply => {
            if (reply._id.startsWith('temp-reply-')) {
              foundTemp = true;
              return newReply;
            }
            if (reply._id === newReply._id) {
              return newReply;
            }
            return reply;
          });

          // Handle edge case: temp reply missing
          if (!foundTemp && !existingReplies.some(r => r._id === newReply._id)) {
            updatedReplies.push(newReply);
          }

          return { ...comment, replies: updatedReplies };
        })
      );

      // Expand replies and cancel reply mode
      setExpandedReplies(prev => new Set([...prev, commentId]));
      setReplyingTo(null);
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      }
    }
  });

  const submitReply = useCallback(async (commentId, replyText) => {
    if (!user) {
      return { success: false, message: 'Please sign in to reply' };
    }

    const trimmedText = replyText.trim();
    if (!trimmedText) {
      return { success: false, message: 'Reply cannot be empty' };
    }

    if (trimmedText.length > REPLY_MAX_LENGTH) {
      return { success: false, message: `Reply cannot exceed ${REPLY_MAX_LENGTH} characters` };
    }

    try {
      const result = await submitReplyMutation.mutateAsync({ commentId, replyText });

      const successMessage = result.data?.status === 'needsReview'
        ? 'Your reply will be reviewed before being displayed.'
        : 'Reply submitted successfully.';

      return { success: true, message: successMessage };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit reply';
      return { success: false, message: errorMessage };
    }
  }, [user, submitReplyMutation]);

  // ==================== RETURN ====================

  return {
    // Data
    comments: transformedComments,
    userComment,

    // Loading states
    isLoading,
    isSubmitting: submitCommentMutation.isPending || submitReplyMutation.isPending,
    error: commentsError?.message || null,

    // UI state
    expandedReplies,
    replyingTo,
    loadingReplies,

    // Actions
    submitComment,
    toggleCommentLike,
    toggleReplies,
    startReply,
    cancelReply,
    submitReply,
    refreshComments,
  };
};

export default useCommentData;
