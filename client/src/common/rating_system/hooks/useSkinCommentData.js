import { useState, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSkinComments,
  getUserSkinComment,
  submitSkinComment,
  likeComment,
  unlikeComment,
  likeReply,
  unlikeReply,
  addReply,
  getRepliesForComment,
  deleteSkinComment,
  deleteSkinReply,
} from '../../../api/championApi';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { toastMessages, useToast } from '../../../toast/useToast';// ✅ Import Toast

const queryKeys = {
  comments: (skinId) => ['skin-comments', skinId],
  userComment: (skinId, userId) => ['user-skin-comment', skinId, userId],
};

const COMMENT_MAX_LENGTH = 1000;
const REPLY_MAX_LENGTH = 500;

const useSkinCommentData = (currentSkinId) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { success, error, info } = useToast(); // ✅ Initialize Toast

  // UI state
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const likeDebounceMap = useRef(new Map());

  // ==================== QUERIES ====================
  
  const {
    data: comments = [],
    isLoading,
    error: commentsError,
    refetch: refreshComments
  } = useQuery({
    queryKey: queryKeys.comments(currentSkinId),
    queryFn: async () => {
      const response = await getSkinComments(currentSkinId, { includeUserDetails: true });
      return response.success ? response.data : [];
    },
    enabled: !!currentSkinId,
    staleTime: 30000, 
  });

  const transformedComments = useMemo(() => {
    return comments.map(comment => ({
      ...comment,
      displayText: comment.comment,
      replyCount: comment.replies?.length ?? comment.replyCount ?? 0,
    }));
  }, [comments]);

  const { data: userComment } = useQuery({
    queryKey: queryKeys.userComment(currentSkinId, user?.id),
    queryFn: async () => {
      const response = await getUserSkinComment(currentSkinId);
      return response.success ? response.data : null;
    },
    enabled: !!currentSkinId && !!user,
  });

  // ==================== MUTATIONS ====================

  const createOptimisticUser = useCallback(() => ({
    id: user.id,
    username: user.username,
    profilePictureURL: user.profilePictureURL,
  }), [user]);

  // 1. Submit Comment Mutation
  const submitCommentMutation = useMutation({
    mutationFn: (commentText) => submitSkinComment(currentSkinId, { comment: commentText.trim() }),

    onMutate: async (commentText) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        comment: commentText.trim(),
        userId: user.id,
        username: user.username,
        user: createOptimisticUser(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved',
        displayText: commentText.trim(),
        skinId: currentSkinId,
        capabilities: { canDelete: true, canEdit: true }
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) => {
        const existingIndex = oldData.findIndex(c => c.userId === user.id);
        const isUpdate = existingIndex !== -1;

        if (isUpdate) {
          const newList = [...oldData];
          newList[existingIndex] = {
            ...oldData[existingIndex],
            ...optimisticComment,
            id: oldData[existingIndex].id,
            createdAt: oldData[existingIndex].createdAt,
            isEdited: true
          };
          return newList;
        } else {
          return [optimisticComment, ...oldData];
        }
      });

      return { previousComments };
    },

    onSuccess: (response, variables, context) => {
      if (!response?.success || !response?.data) return;

      const submittedComment = response.data;
      const commentForList = {
        ...submittedComment,
        displayText: submittedComment.comment,
        user: createOptimisticUser()
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) => {
        let foundTemp = false;
        const updatedComments = oldData.map(comment => {
          if (comment.id.startsWith('temp-')) {
            foundTemp = true;
            return commentForList;
          }
          if (comment.id === commentForList.id) {
            return commentForList;
          }
          return comment;
        });

        if (!foundTemp && !oldData.some(c => c.id === commentForList.id)) {
          return [commentForList, ...updatedComments];
        }
        return updatedComments;
      });

      // ✅ TOAST LOGIC
      if (submittedComment.status === 'rejected') {
        error('Your comment was rejected due to content guidelines.');
      } else if (submittedComment.status === 'needsReview') {
        info('Your comment is pending review.');
      } else {
        success(toastMessages.comment.success);
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(currentSkinId) });
      }
      // ✅ TOAST LOGIC
      error(err.response?.data?.error || toastMessages.comment.error);
    }
  });

  const submitComment = useCallback(async (commentText) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return false;
    }

    const trimmedText = commentText.trim();
    if (!trimmedText) {
      info('Comment cannot be empty');
      return false;
    }

    if (trimmedText.length > COMMENT_MAX_LENGTH) {
      info(`Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`);
      return false;
    }

    try {
      await submitCommentMutation.mutateAsync(commentText);
      return true; // Return true to clear the form
    } catch (err) {
      return false; // Return false to keep input
    }
  }, [user, submitCommentMutation, info]);

  // 4. Like/Unlike Mutation
  const toggleCommentLikeMutation = useMutation({
    mutationFn: ({ commentId, isCurrentlyLiked, parentCommentId }) => {
      if (parentCommentId) {
        return isCurrentlyLiked
          ? unlikeReply(currentSkinId, parentCommentId, commentId)
          : likeReply(currentSkinId, parentCommentId, commentId);
      }
      return isCurrentlyLiked
        ? unlikeComment(currentSkinId, commentId)
        : likeComment(currentSkinId, commentId);
    },

    onMutate: async ({ commentId, isCurrentlyLiked, parentCommentId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.map(comment => {
          // Case 1: Liking a Reply
          if (parentCommentId && comment.id === parentCommentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                    ...reply,
                    likedBy: isCurrentlyLiked
                      ? reply.likedBy.filter(id => id !== user.id)
                      : [...(reply.likedBy || []), user.id]
                  }
                  : reply
              )
            };
          }
          // Case 2: Liking a Comment
          else if (!parentCommentId && comment.id === commentId) {
            return {
              ...comment,
              likedBy: isCurrentlyLiked
                ? comment.likedBy.filter(id => id !== user.id)
                : [...(comment.likedBy || []), user.id]
            };
          }
          return comment;
        })
      );
      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      }
    }
  });

  const toggleCommentLike = useCallback(async (commentId, isCurrentlyLiked, parentCommentId = null) => {
    if (!user) return;
    if (likeDebounceMap.current.has(commentId)) clearTimeout(likeDebounceMap.current.get(commentId));

    const timeoutId = setTimeout(async () => {
      try {
        await toggleCommentLikeMutation.mutateAsync({ commentId, isCurrentlyLiked, parentCommentId });
      } catch (err) {
        console.error('Failed to toggle like:', err);
      } finally {
        likeDebounceMap.current.delete(commentId);
      }
    }, 300);

    likeDebounceMap.current.set(commentId, timeoutId);
  }, [user, toggleCommentLikeMutation]);

  // ==================== REPLIES ====================

  const loadReplies = useCallback(async (commentId) => {
    const currentComments = queryClient.getQueryData(queryKeys.comments(currentSkinId)) || [];
    const comment = currentComments.find(c => c.id === commentId);

    if (loadingReplies.has(commentId) || (comment?.replies && comment.replies.length > 0)) return;

    setLoadingReplies(prev => new Set([...prev, commentId]));

    try {
      const response = await getRepliesForComment(currentSkinId, commentId, { includeUserDetails: true });
      if (response.success) {
        const transformedReplies = response.data.map(reply => ({
          ...reply,
          displayText: reply.comment,
        }));

        queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
          oldData.map(comment => {
            if (comment.id !== commentId) return comment;
            const existingReplies = comment.replies || [];
            const tempReplies = existingReplies.filter(r => r.id.startsWith('temp-reply-'));
            const mergedReplies = [...transformedReplies];
            tempReplies.forEach(temp => {
              if (!mergedReplies.some(r => r.id === temp.id)) {
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

  const toggleReplies = useCallback(async (commentId) => {
    const isCurrentlyExpanded = expandedReplies.has(commentId);
    if (isCurrentlyExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      const currentComments = queryClient.getQueryData(queryKeys.comments(currentSkinId)) || [];
      const comment = currentComments.find(c => c.id === commentId);
      if (!comment?.replies || comment.replies.length === 0) {
        await loadReplies(commentId);
      }
      setExpandedReplies(prev => new Set([...prev, commentId]));
    }
  }, [expandedReplies, currentSkinId, loadReplies, queryClient]);

  const startReply = useCallback((commentId) => setReplyingTo(commentId), []);
  const cancelReply = useCallback(() => setReplyingTo(null), []);

  // 5. Submit Reply Mutation
  const submitReplyMutation = useMutation({
    mutationFn: ({ commentId, replyText }) =>
      addReply(currentSkinId, commentId, { comment: replyText.trim() }),

    onMutate: async ({ commentId, replyText }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));

      const optimisticReply = {
        id: `temp-reply-${Date.now()}`,
        userId: user.id,
        username: user.username,
        comment: replyText.trim(),
        createdAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved',
        displayText: replyText.trim(),
        user: createOptimisticUser(),
        capabilities: { canDelete: true, canEdit: true }
      };

      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.map(comment =>
          comment.id === commentId
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
          if (comment.id !== commentId) return comment;
          const existingReplies = comment.replies || [];
          let foundTemp = false;
          const updatedReplies = existingReplies.map(reply => {
            if (reply.id.startsWith('temp-reply-')) {
              foundTemp = true;
              return newReply;
            }
            if (reply.id === newReply.id) {
              return newReply;
            }
            return reply;
          });
          if (!foundTemp && !existingReplies.some(r => r.id === newReply.id)) {
            updatedReplies.push(newReply);
          }
          return { ...comment, replies: updatedReplies };
        })
      );

      setExpandedReplies(prev => new Set([...prev, commentId]));
      setReplyingTo(null);

      // ✅ TOAST LOGIC
      if (response.data.status === 'needsReview') {
        info('Your reply is pending review.');
      } else {
        success(toastMessages.reply.success);
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      }
      // ✅ TOAST LOGIC
      error(toastMessages.reply.error);
    }
  });

  const submitReply = useCallback(async (commentId, replyText) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return false;
    }

    const trimmedText = replyText.trim();
    if (!trimmedText) {
      info('Reply cannot be empty');
      return false;
    }

    if (trimmedText.length > REPLY_MAX_LENGTH) {
      info(`Reply cannot exceed ${REPLY_MAX_LENGTH} characters`);
      return false;
    }

    try {
      await submitReplyMutation.mutateAsync({ commentId, replyText });
      return true; // Success
    } catch (err) {
      return false; // Failure
    }
  }, [user, submitReplyMutation, info]);

  // ==================== DELETE ====================

  // 6. Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteSkinComment(currentSkinId, commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));
      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.filter(comment => comment.id !== commentId)
      );
      return { previousComments };
    },

    onSuccess: () => {
      success('Comment deleted.');
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      }
      error(err.response?.data?.error || 'Failed to delete comment');
    }
  });

  const deleteComment = useCallback(async (commentId) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return false;
    }
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      return true;
    } catch (err) {
      return false;
    }
  }, [user, deleteCommentMutation, info]);

  // 7. Delete Reply Mutation
  const deleteReplyMutation = useMutation({
    mutationFn: ({ commentId, replyId }) => deleteSkinReply(currentSkinId, commentId, replyId),

    onMutate: async ({ commentId, replyId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(currentSkinId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(currentSkinId));
      queryClient.setQueryData(queryKeys.comments(currentSkinId), (oldData = []) =>
        oldData.map(comment => {
          if (comment.id !== commentId) return comment;
          return {
            ...comment,
            replies: (comment.replies || []).filter(reply => reply.id !== replyId)
          };
        })
      );
      return { previousComments };
    },

    onSuccess: () => {
      success('Reply deleted.');
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(currentSkinId), context.previousComments);
      }
      error(err.response?.data?.error || 'Failed to delete reply');
    }
  });

  const deleteReply = useCallback(async (commentId, replyId) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return false;
    }
    try {
      await deleteReplyMutation.mutateAsync({ commentId, replyId });
      return true;
    } catch (err) {
      return false;
    }
  }, [user, deleteReplyMutation, info]);

  // ==================== REFRESH ====================

  const handleRefresh = useCallback(async () => {
    const COOLDOWN_PERIOD = 5000;
    const now = Date.now();
    if (now - lastRefreshTime < COOLDOWN_PERIOD) {
      info('Please wait before refreshing again');
      return { success: false };
    }
    if (isRefreshing) return { success: false };
    
    try {
      setIsRefreshing(true);
      setLastRefreshTime(now);
      setExpandedReplies(new Set());
      setReplyingTo(null);
      setLoadingReplies(new Set());
      await refreshComments();
      success('Comments refreshed');
      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshComments, lastRefreshTime, isRefreshing, info, success]);

  // ==================== RETURN ====================

  return {
    comments: transformedComments,
    userComment,
    isLoading,
    isSubmitting: submitCommentMutation.isPending || submitReplyMutation.isPending,
    isRefreshing,

    error: commentsError?.message || null,
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
    refreshComments: handleRefresh,
  };
};

export default useSkinCommentData;