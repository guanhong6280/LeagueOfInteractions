import { useState, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getChampionComments, 
  getUserChampionComment, 
  submitChampionComment,
  likeChampionComment,
  unlikeChampionComment,
  addChampionReply,
  getChampionRepliesForComment,
  deleteChampionComment,
  deleteChampionReply,
} from '../../../api/championApi';
import useCurrentUser from '../../../hooks/useCurrentUser';

const queryKeys = {
  comments: (championId) => ['champion-comments', championId],
  userComment: (championId, userId) => ['user-champion-comment', championId, userId],
};

const COMMENT_MAX_LENGTH = 1000;
const REPLY_MAX_LENGTH = 500;

const useChampionCommentData = (championId) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

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
    queryKey: queryKeys.comments(championId),
    queryFn: async () => {
      // ✅ Correct: Passing object per your API definition
      const response = await getChampionComments(championId, { includeUserDetails: true });
      console.log('response from useChampionCommentData', response);
      return response.success ? response.data : [];
    },
    enabled: !!championId,
    staleTime: 30000, 
  });

  const transformedComments = useMemo(() => {
    return comments.map(comment => ({
      ...comment,
      displayText: comment.comment, 
      // Ensure we use the server's replyCount if available, or the array length
      replyCount: comment.replies?.length ?? comment.replyCount ?? 0,
    }));
  }, [comments]);

  const { data: userComment } = useQuery({
    queryKey: queryKeys.userComment(championId, user?.id),
    queryFn: async () => {
      const response = await getUserChampionComment(championId);
      return response.success ? response.data : null;
    },
    enabled: !!championId && !!user,
  });

  // ==================== MUTATIONS ====================

  // Helper to create the nested user object for optimistic updates
  const createOptimisticUser = useCallback(() => ({
    username: user.username,
    profilePictureURL: user.profilePictureURL,
  }), [user]);

  // 1. Submit Comment Mutation
  const submitCommentMutation = useMutation({
    mutationFn: (commentText) => submitChampionComment(championId, { comment: commentText.trim() }),

    onMutate: async (commentText) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(championId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(championId));

      const optimisticComment = {
        id: `temp-${Date.now()}`,  
        comment: commentText.trim(),
        userId: user.id,
        user: createOptimisticUser(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved', // Optimistically assume approved
        displayText: commentText.trim(),
        championId: championId,
        // ✅ FIX 2: Add capabilities so "Delete" button appears immediately
        capabilities: {
          canDelete: true,
          canEdit: true
        }
      };

      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) => {
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
        // Ensure user object is present (sometimes backend might just return userId if populate failed)
        user: submittedComment.user || createOptimisticUser() 
      };

      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) => {
        // ... (Same replacement logic as before) ...
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
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.comments(championId), context.previousComments);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(championId) });
      }
    }
  });

  const submitComment = useCallback(async (commentText) => {
    if (!user) return { success: false, message: 'Please sign in to comment' };

    const trimmedText = commentText.trim();
    if (!trimmedText) return { success: false, message: 'Comment cannot be empty' };
    if (trimmedText.length > COMMENT_MAX_LENGTH) return { success: false, message: `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters` };

    try {
      const result = await submitCommentMutation.mutateAsync(commentText);
      if (!result.success) return { success: false, message: result.message || 'Failed to submit comment' };

      const submittedComment = result.data;
      if (submittedComment.status === 'rejected') {
        return { success: false, message: 'Your comment was rejected.', status: 'rejected' };
      }

      const successMessage = submittedComment.status === 'needsReview'
        ? 'Your comment will be reviewed.'
        : userComment ? 'Comment updated successfully.' : 'Comment submitted successfully.';

      return { success: true, message: successMessage, status: submittedComment.status };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Failed to submit comment' };
    }
  }, [user, submitCommentMutation, userComment]);

  // 2. Like/Unlike Mutation (Logic remains same, checking likedBy array)
  const toggleCommentLikeMutation = useMutation({
    mutationFn: ({ commentId, isCurrentlyLiked }) =>
      isCurrentlyLiked
        ? unlikeChampionComment(championId, commentId)
        : likeChampionComment(championId, commentId),

    onMutate: async ({ commentId, isCurrentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(championId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(championId));

      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) =>
        oldData.map(comment =>
          (comment.id === commentId)
            ? {
              ...comment,
              likedBy: isCurrentlyLiked
                ? comment.likedBy.filter(id => id !== user.id)
                : [...(comment.likedBy || []), user.id]
            }
            : comment
        )
      );
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(queryKeys.comments(championId), context.previousComments);
    }
  });

  const toggleCommentLike = useCallback(async (commentId, isCurrentlyLiked) => {
    if (!user) return;
    if (likeDebounceMap.current.has(commentId)) clearTimeout(likeDebounceMap.current.get(commentId));

    const timeoutId = setTimeout(async () => {
      try {
        await toggleCommentLikeMutation.mutateAsync({ commentId, isCurrentlyLiked });
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
    const currentComments = queryClient.getQueryData(queryKeys.comments(championId)) || [];
    const comment = currentComments.find(c => c.id === commentId);

    if (loadingReplies.has(commentId) || (comment?.replies && comment.replies.length > 0)) return;

    setLoadingReplies(prev => new Set([...prev, commentId]));

    try {
      // ✅ Correct: Passing object for options
      const response = await getChampionRepliesForComment(championId, commentId, { includeUserDetails: true });
      console.log('response from loadReplies', response);
      if (response.success) {
        const transformedReplies = response.data.map(reply => ({
          ...reply,
          displayText: reply.comment,
        }));

        queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) =>
          oldData.map(c => {
            if (c.id !== commentId) return c;

            // Preserve temp replies during load
            const existingReplies = c.replies || [];
            const tempReplies = existingReplies.filter(r => r.id?.startsWith('temp-reply-'));
            
            // Merge logic
            const mergedReplies = [...transformedReplies];
            tempReplies.forEach(temp => {
              if (!mergedReplies.some(r => r.id === temp.id)) {
                mergedReplies.push(temp);
              }
            });

            return { ...c, replies: mergedReplies };
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
  }, [championId, loadingReplies, queryClient]);

  const toggleReplies = useCallback(async (commentId) => {
    const isCurrentlyExpanded = expandedReplies.has(commentId);
    if (isCurrentlyExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      const currentComments = queryClient.getQueryData(queryKeys.comments(championId)) || [];
      const comment = currentComments.find(c => c.id === commentId);

      if (!comment?.replies || comment.replies.length === 0) {
        await loadReplies(commentId);
      }
      setExpandedReplies(prev => new Set([...prev, commentId]));
    }
  }, [expandedReplies, championId, loadReplies, queryClient]);

  const startReply = useCallback((commentId) => setReplyingTo(commentId), []);
  const cancelReply = useCallback(() => setReplyingTo(null), []);

  // 3. Submit Reply Mutation
  const submitReplyMutation = useMutation({
    mutationFn: ({ commentId, replyText }) =>
      addChampionReply(championId, commentId, { comment: replyText.trim() }),

    onMutate: async ({ commentId, replyText }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(championId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(championId));

      const optimisticReply = {
        id: `temp-reply-${Date.now()}`,
        userId: user.id,
        user: createOptimisticUser(), 
        comment: replyText.trim(),
        createdAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved',
        displayText: replyText.trim(),
        // ✅ FIX 4: Add capabilities
        capabilities: {
          canDelete: true,
          canEdit: true
        }
      };

      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) =>
        oldData.map(comment =>
          (comment.id === commentId)
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
        user: createOptimisticUser() // Ensure we have local user data if server didn't send it back fully populated
      };

      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) =>
        oldData.map(comment => {
          if (comment.id !== commentId) return comment;

          const existingReplies = comment.replies || [];
          let foundTemp = false;
          
          const updatedReplies = existingReplies.map(reply => {
            if (reply.id?.startsWith('temp-reply-')) {
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
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(queryKeys.comments(championId), context.previousComments);
    }
  });

  const submitReply = useCallback(async (commentId, replyText) => {
    if (!user) return { success: false, message: 'Please sign in to reply' };
    const trimmedText = replyText.trim();
    if (!trimmedText) return { success: false, message: 'Reply cannot be empty' };
    if (trimmedText.length > REPLY_MAX_LENGTH) return { success: false, message: `Reply cannot exceed ${REPLY_MAX_LENGTH} characters` };

    try {
      const result = await submitReplyMutation.mutateAsync({ commentId, replyText });
      const successMessage = result.data?.status === 'needsReview' ? 'Your reply will be reviewed.' : 'Reply submitted successfully.';
      return { success: true, message: successMessage };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Failed to submit reply' };
    }
  }, [user, submitReplyMutation]);

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteChampionComment(championId, commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(championId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(championId));
      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) =>
        oldData.filter(comment => comment.id !== commentId)
      );
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(queryKeys.comments(championId), context.previousComments);
    }
  });

  const deleteComment = useCallback(async (commentId) => {
    if (!user) return { success: false, message: 'Please sign in' };
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      return { success: true, message: 'Comment deleted' };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Failed to delete' };
    }
  }, [user, deleteCommentMutation]);

  const deleteReplyMutation = useMutation({
    mutationFn: ({ commentId, replyId }) => deleteChampionReply(championId, commentId, replyId),
    onMutate: async ({ commentId, replyId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(championId) });
      const previousComments = queryClient.getQueryData(queryKeys.comments(championId));
      queryClient.setQueryData(queryKeys.comments(championId), (oldData = []) =>
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
    onError: (err, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(queryKeys.comments(championId), context.previousComments);
    }
  });

  const deleteReply = useCallback(async (commentId, replyId) => {
    if (!user) return { success: false, message: 'Please sign in' };
    try {
      await deleteReplyMutation.mutateAsync({ commentId, replyId });
      return { success: true, message: 'Reply deleted' };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Failed to delete reply' };
    }
  }, [user, deleteReplyMutation]);

  const handleRefresh = useCallback(async () => {
    const COOLDOWN_PERIOD = 5000;
    const now = Date.now();
    if (now - lastRefreshTime < COOLDOWN_PERIOD) return { success: false, message: 'Please wait' };
    if (isRefreshing) return { success: false, message: 'In progress' };
    
    try {
      setIsRefreshing(true);
      setLastRefreshTime(now);
      setExpandedReplies(new Set());
      setReplyingTo(null);
      setLoadingReplies(new Set());
      await refreshComments();
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed' };
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshComments, lastRefreshTime, isRefreshing]);

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

export default useChampionCommentData;