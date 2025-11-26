import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getChampionComments, 
  getUserChampionComment, 
  submitChampionComment,
  likeChampionComment,
  unlikeChampionComment,
  addChampionReply,
  getChampionRepliesForComment,
  likeChampionReply,
  unlikeChampionReply
} from '../../../api/championApi';
import { useAuth } from '../../../AuthProvider';

const useChampionCommentData = (championId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // UI state
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(new Set());

  // 1. FETCH COMMENTS
  const { 
    data: rawComments = [], 
    isLoading, 
    error: commentsError,
    refetch: refreshComments 
  } = useQuery({
    queryKey: ['championComments', championId],
    queryFn: () => getChampionComments(championId, true),
    enabled: !!championId,
    select: (response) => {
      if (!response.success) return [];
      return response.data;
    }
  });

  const cacheData = queryClient.getQueryData(['championComments', championId]);
  const cacheComments = Array.isArray(cacheData) ? cacheData : (cacheData?.data || []);
  
  const comments = useMemo(() => {
    return cacheComments.map(comment => ({
      ...comment,
      displayText: comment.status === 'needsReview' 
        ? "This comment is under review" 
        : comment.status === 'rejected'
        ? "I love league of legend, I love Riot Games!!!"
        : comment.comment,
      isInteractionDisabled: comment.status === 'needsReview' || comment.status === 'rejected'
    }));
  }, [cacheComments]);

  // 2. FETCH USER'S COMMENT
  const { data: userComment } = useQuery({
    queryKey: ['userChampionComment', championId, user?._id],
    queryFn: () => getUserChampionComment(championId),
    enabled: !!championId && !!user,
    select: (response) => response.success ? response.data : null
  });

  // 3. SUBMIT COMMENT
  const submitCommentMutation = useMutation({
    mutationFn: (commentText) => submitChampionComment(championId, { comment: commentText.trim() }),
    
    onMutate: async (commentText) => {
      await queryClient.cancelQueries(['championComments', championId]);
      const previousComments = queryClient.getQueryData(['championComments', championId]);
      
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        comment: commentText.trim(),
        userId: user._id,
        username: user.username,
        user: {
          _id: user._id,
          username: user.username,
          profilePictureURL: user.profilePictureURL
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likedBy: [],
        isEdited: false,
        status: 'approved',
        displayText: commentText.trim(),
        isInteractionDisabled: false,
        championId: championId
      };
      
      queryClient.setQueryData(['championComments', championId], oldData => {
        const existingComments = Array.isArray(oldData) ? oldData : [];
        return [optimisticComment, ...existingComments];
      });
      
      return { previousComments };
    },
    
    onSuccess: (response) => {
      if (!response.success || !response.data) return;
      
      const submittedComment = response.data;
      
      if (submittedComment.status === 'rejected') {
        queryClient.setQueryData(['championComments', championId], oldData => {
          const existingComments = Array.isArray(oldData) ? oldData : [];
          return existingComments.filter(comment => !comment._id.startsWith('temp-'));
        });
        return;
      }
      
      const commentForList = {
        ...submittedComment,
        displayText: submittedComment.status === 'needsReview' 
          ? "This comment is under review" 
          : submittedComment.status === 'rejected'
          ? "I love league of legend, I love Riot Games!!!"
          : submittedComment.comment,
        isInteractionDisabled: submittedComment.status === 'rejected' || submittedComment.status === 'needsReview',
        user: {
          _id: user._id,
          username: user.username,
          profilePictureURL: user.profilePictureURL
        }
      };
      
      queryClient.setQueryData(['championComments', championId], oldData => {
        const existingComments = Array.isArray(oldData) ? oldData : [];
        return existingComments.map(comment => 
          comment._id.startsWith('temp-') ? commentForList : comment
        );
      });
    },
    
    onError: (err, commentText, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['championComments', championId], context.previousComments);
      } else {
        queryClient.invalidateQueries(['championComments', championId]);
      }
    }
  });

  const submitComment = useCallback(async (commentText) => {
    if (!user) return { success: false, message: 'Please sign in to comment' };
    if (!commentText.trim()) return { success: false, message: 'Comment cannot be empty' };
    if (commentText.length > 1000) return { success: false, message: 'Comment cannot exceed 1000 characters' };

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

  // 4. LIKE/UNLIKE
  const toggleCommentLikeMutation = useMutation({
    mutationFn: ({ commentId, isCurrentlyLiked }) => 
      isCurrentlyLiked 
        ? unlikeChampionComment(championId, commentId)
        : likeChampionComment(championId, commentId),
    
    onMutate: async ({ commentId, isCurrentlyLiked }) => {
      await queryClient.cancelQueries(['championComments', championId]);
      const previousComments = queryClient.getQueryData(['championComments', championId]);
      
      queryClient.setQueryData(['championComments', championId], oldData =>
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
      queryClient.setQueryData(['championComments', championId], context.previousComments);
    }
  });

  const toggleCommentLike = useCallback(async (commentId, isCurrentlyLiked) => {
    if (!user) return;
    try {
      await toggleCommentLikeMutation.mutateAsync({ commentId, isCurrentlyLiked });
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  }, [user, toggleCommentLikeMutation]);

  // Load Replies
  const loadReplies = useCallback(async (commentId) => {
    const comment = comments.find(c => c._id === commentId);
    if (loadingReplies.has(commentId) || (comment?.replies && comment.replies.length > 0)) return;

    setLoadingReplies(prev => new Set([...prev, commentId]));

    try {
      const response = await getChampionRepliesForComment(championId, commentId, true);
      if (response.success) {
        const transformedReplies = response.data.map(reply => ({
          ...reply,
          displayText: reply.status === 'needsReview' 
            ? "This reply is under review" 
            : reply.status === 'rejected'
            ? "I love league of legend, I love Riot Games!!!"
            : reply.comment,
          isInteractionDisabled: reply.status === 'needsReview'
        }));

        queryClient.setQueryData(['championComments', championId], oldData =>
          oldData.map(comment => 
            comment._id === commentId 
              ? { ...comment, replies: transformedReplies }
              : comment
          )
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
  }, [championId, comments, loadingReplies, queryClient]);

  const toggleReplies = useCallback(async (commentId) => {
    const isCurrentlyExpanded = expandedReplies.has(commentId);
    if (isCurrentlyExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      const comment = comments.find(c => c._id === commentId);
      if (!comment?.replies || comment.replies.length === 0) {
        await loadReplies(commentId);
      }
      setExpandedReplies(prev => new Set([...prev, commentId]));
    }
  }, [expandedReplies, comments, loadReplies]);

  // Reply Actions
  const startReply = useCallback((commentId) => setReplyingTo(commentId), []);
  const cancelReply = useCallback(() => setReplyingTo(null), []);

  const submitReplyMutation = useMutation({
    mutationFn: ({ commentId, replyText }) => addChampionReply(championId, commentId, { comment: replyText.trim() }),
    
    onMutate: async ({ commentId, replyText }) => {
      await queryClient.cancelQueries(['championComments', championId]);
      const previousComments = queryClient.getQueryData(['championComments', championId]);
      
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
        isInteractionDisabled: false
      };
      
      queryClient.setQueryData(['championComments', championId], oldData =>
        oldData.map(comment => 
          comment._id === commentId 
            ? { ...comment, replies: [...(comment.replies || []), optimisticReply] }
            : comment
        )
      );
      
      return { previousComments };
    },
    
    onSuccess: (response, { commentId }) => {
      if (response.success) {
        const newReply = {
          ...response.data,
          displayText: response.data.status === 'needsReview' 
            ? "This reply is under review" 
            : response.data.status === 'rejected'
            ? "I love league of legend, I love Riot Games!!!"
            : response.data.comment,
          isInteractionDisabled: response.data.status === 'needsReview',
          user: {
            _id: user._id,
            username: user.username,
            profilePictureURL: user.profilePictureURL
          }
        };
        
        queryClient.setQueryData(['championComments', championId], oldData =>
          oldData.map(comment => 
            comment._id === commentId 
              ? { 
                  ...comment, 
                  replies: comment.replies.map(reply => 
                    reply._id.startsWith('temp-reply-') ? newReply : reply
                  )
                }
              : comment
          )
        );
        
        setExpandedReplies(prev => new Set([...prev, commentId]));
        setReplyingTo(null);
      }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(['championComments', championId], context.previousComments);
    }
  });

  const submitReply = useCallback(async (commentId, replyText) => {
    if (!user) return { success: false };
    if (!replyText.trim()) return { success: false };
    if (replyText.length > 500) return { success: false };

    try {
      const result = await submitReplyMutation.mutateAsync({ commentId, replyText });
      const successMessage = result.status === 'needsReview'
        ? 'Your reply will be reviewed.'
        : 'Reply submitted successfully.';
      return { success: true, message: successMessage };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Failed to submit reply' };
    }
  }, [user, submitReplyMutation]);

  return {
    comments,
    userComment,
    isLoading,
    isSubmitting: submitCommentMutation.isPending || submitReplyMutation.isPending,
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
    clearError: () => {},
    refreshComments,
  };
};

export default useChampionCommentData;

