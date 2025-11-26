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
  likeReply,
  unlikeReply
} from '../../../api/championApi';
import { useAuth } from '../../../AuthProvider';

const useCommentData = (currentSkinId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // UI state (still local state)
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(new Set());

  // 1. FETCH COMMENTS with React Query
  const { 
    data: rawComments = [], 
    isLoading, 
    error: commentsError,
    refetch: refreshComments 
  } = useQuery({
    queryKey: ['comments', currentSkinId],
    queryFn: () => getSkinComments(currentSkinId, true),
    enabled: !!currentSkinId,
    select: (response) => {
      if (!response.success) return [];
      console.log(`commentsResponse.data`, response.data);
      return response.data;
    }
  });

  // Get comments directly from cache to ensure we always have the latest data
  const cacheData = queryClient.getQueryData(['comments', currentSkinId]);
  const cacheComments = Array.isArray(cacheData) ? cacheData : (cacheData?.data || []);
  
  // Transform comments with useMemo
  const comments = useMemo(() => {
    console.log('🔄 useMemo re-running for comments transformation. Cache comments:', cacheComments);
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

  // 2. FETCH USER'S COMMENT with React Query
  const { data: userComment } = useQuery({
    queryKey: ['userComment', currentSkinId, user?._id],
    queryFn: () => getUserSkinComment(currentSkinId),
    enabled: !!currentSkinId && !!user,
    select: (response) => response.success ? response.data : null
  });

  // 3. SUBMIT COMMENT with React Query mutation
  const submitCommentMutation = useMutation({
    mutationFn: (commentText) => submitSkinComment(currentSkinId, { comment: commentText.trim() }),
    
    onMutate: async (commentText) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['comments', currentSkinId]);
      
      // Snapshot previous value
      const previousComments = queryClient.getQueryData(['comments', currentSkinId]);
      
      // Create optimistic comment
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
        skinId: currentSkinId
      };
      
      // Optimistically update
      queryClient.setQueryData(['comments', currentSkinId], oldData => {
        const existingComments = Array.isArray(oldData) ? oldData : [];
        return [optimisticComment, ...existingComments];
      });
      
      return { previousComments };
    },
    
    onSuccess: (response) => {
      console.log('🎉 Mutation onSuccess called with response:', response);
      console.log('🎉 Response structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataValue: response.data,
        hasSuccess: 'success' in response,
        successValue: response.success
      });
      
      // response is the full API response from submitSkinComment
      // Check if response has the expected structure
      if (!response.success || !response.data) {
        console.error('❌ Invalid response structure:', response);
        return;
      }
      
      const submittedComment = response.data;
      console.log('📝 Submitted comment:', submittedComment);
      
      // Handle different moderation statuses
      if (submittedComment.status === 'rejected') {
        console.log('🚫 Comment rejected, removing optimistic comment');
        // Remove optimistic comment
        queryClient.setQueryData(['comments', currentSkinId], oldData => {
          const existingComments = Array.isArray(oldData) ? oldData : [];
          return existingComments.filter(comment => !comment._id.startsWith('temp-'));
        });
        return;
      }
      
      // Update with real data
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
      
      console.log('🔄 Replacing optimistic comment with real data:', commentForList);
      const currentComments = queryClient.getQueryData(['comments', currentSkinId]);
      console.log('🔄 Current comments before update:', currentComments);
      console.log('🔄 Current comments details:', currentComments?.map(c => ({ id: c._id, text: c.comment, isTemp: c._id.startsWith('temp-') })));
      
      // Replace optimistic comment with real data
      queryClient.setQueryData(['comments', currentSkinId], oldData => {
        const existingComments = Array.isArray(oldData) ? oldData : [];
        const updatedComments = existingComments.map(comment => 
          comment._id.startsWith('temp-') ? commentForList : comment
        );
        console.log('🔄 Updated comments after replacement:', updatedComments);
        console.log('🔄 Updated comments details:', updatedComments.map(c => ({ id: c._id, text: c.comment, isTemp: c._id.startsWith('temp-') })));
        return updatedComments;
      });
      
      const finalComments = queryClient.getQueryData(['comments', currentSkinId]);
      console.log('🔄 Final comments after setQueryData:', finalComments);
      console.log('🔄 Final comments details:', finalComments?.map(c => ({ id: c._id, text: c.comment, isTemp: c._id.startsWith('temp-') })));
    },
    
    onError: (err, commentText, context) => {
      console.error('💥 Mutation onError called:', err);
      // Revert optimistic update on error
      if (context && context.previousComments) {
        queryClient.setQueryData(['comments', currentSkinId], context.previousComments);
      } else {
        // If no context, just refetch the data
        queryClient.invalidateQueries(['comments', currentSkinId]);
      }
    }
  });

  // Wrapper function to maintain the same interface
  const submitComment = useCallback(async (commentText) => {
    if (!user) {
      return { success: false, message: 'Please sign in to comment' };
    }

    if (!commentText.trim()) {
      return { success: false, message: 'Comment cannot be empty' };
    }

    if (commentText.length > 1000) {
      return { success: false, message: 'Comment cannot exceed 1000 characters' };
    }

    try {
      console.log('🚀 Submitting comment:', commentText);
      const result = await submitCommentMutation.mutateAsync(commentText);
      console.log('✅ Comment submission result:', result);
      
      // result is the full API response from submitSkinComment
      if (!result.success) {
        console.log('❌ Comment submission failed:', result);
        return { success: false, message: result.message || 'Failed to submit comment' };
      }
      
      const submittedComment = result.data;
      console.log('📝 Submitted comment data:', submittedComment);
      
      if (submittedComment.status === 'rejected') {
        return { success: false, message: 'Your comment was rejected due to inappropriate content. Please revise and try again.', status: 'rejected' };
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
      console.error('💥 Comment submission error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit comment';
      return { success: false, message: errorMessage };
    }
  }, [user, submitCommentMutation, userComment]);

  // 4. LIKE/UNLIKE COMMENT with React Query mutation
  const toggleCommentLikeMutation = useMutation({
    mutationFn: ({ commentId, isCurrentlyLiked }) => 
      isCurrentlyLiked 
        ? unlikeComment(currentSkinId, commentId)
        : likeComment(currentSkinId, commentId),
    
    onMutate: async ({ commentId, isCurrentlyLiked }) => {
      await queryClient.cancelQueries(['comments', currentSkinId]);
      const previousComments = queryClient.getQueryData(['comments', currentSkinId]);
      
      // Optimistic update
      queryClient.setQueryData(['comments', currentSkinId], oldData =>
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
      // Revert on error
      queryClient.setQueryData(['comments', currentSkinId], context.previousComments);
    }
  });

  // Wrapper function to maintain the same interface
  const toggleCommentLike = useCallback(async (commentId, isCurrentlyLiked) => {
    if (!user) {
      return;
    }

    try {
      await toggleCommentLikeMutation.mutateAsync({ commentId, isCurrentlyLiked });
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  }, [user, toggleCommentLikeMutation]);

  // Load replies for a comment (lazy loading)
  const loadReplies = useCallback(async (commentId) => {
    const comment = comments.find(c => c._id === commentId);
    
    if (loadingReplies.has(commentId) || (comment?.replies && comment.replies.length > 0)) {
      return;
    }

    setLoadingReplies(prev => new Set([...prev, commentId]));

    try {
      const response = await getRepliesForComment(currentSkinId, commentId, true);
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

        // Update the comment with loaded replies using React Query cache
        queryClient.setQueryData(['comments', currentSkinId], oldData =>
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
  }, [currentSkinId, comments, loadingReplies, queryClient]);

  // Toggle reply expansion
  const toggleReplies = useCallback(async (commentId) => {
    const isCurrentlyExpanded = expandedReplies.has(commentId);
    
    if (isCurrentlyExpanded) {
      // Collapse replies
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Expand replies - load them if not already loaded
      const comment = comments.find(c => c._id === commentId);
      
      if (!comment?.replies || comment.replies.length === 0) {
        console.log("test loadReplies");
        await loadReplies(commentId);
      }
      
      // Expand after loading
      setExpandedReplies(prev => new Set([...prev, commentId]));
    }
  }, [expandedReplies, comments, loadReplies]);

  // Start/stop replying
  const startReply = useCallback((commentId) => {
    setReplyingTo(commentId);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // 5. SUBMIT REPLY with React Query mutation
  const submitReplyMutation = useMutation({
    mutationFn: ({ commentId, replyText }) => addReply(currentSkinId, commentId, { comment: replyText.trim() }),
    
    onMutate: async ({ commentId, replyText }) => {
      await queryClient.cancelQueries(['comments', currentSkinId]);
      const previousComments = queryClient.getQueryData(['comments', currentSkinId]);
      
      // Create optimistic reply
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
      
      // Add optimistic reply
      queryClient.setQueryData(['comments', currentSkinId], oldData =>
        oldData.map(comment => 
          comment._id === commentId 
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), optimisticReply]
              }
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
        
        // Replace optimistic reply with real data
        queryClient.setQueryData(['comments', currentSkinId], oldData =>
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
        
        // Expand replies and cancel reply mode
        setExpandedReplies(prev => new Set([...prev, commentId]));
        setReplyingTo(null);
      }
    },
    
    onError: (err, variables, context) => {
      // Revert on error
      queryClient.setQueryData(['comments', currentSkinId], context.previousComments);
    }
  });

  // Wrapper function to maintain the same interface
  const submitReply = useCallback(async (commentId, replyText) => {
    if (!user) {
      return { success: false };
    }

    if (!replyText.trim()) {
      return { success: false };
    }

    if (replyText.length > 500) {
      return { success: false };
    }

    try {
      const result = await submitReplyMutation.mutateAsync({ commentId, replyText });
      
      const successMessage = result.status === 'needsReview'
        ? 'Your reply will be reviewed before being displayed.'
        : 'Reply submitted successfully.';

      return { success: true, message: successMessage };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit reply';
      return { success: false, message: errorMessage };
    }
  }, [user, submitReplyMutation]);



  // Clear error (React Query handles errors automatically)
  const clearError = useCallback(() => {
    // React Query handles errors automatically
  }, []);

  return {
    // Data
    comments,
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
    clearError: () => {}, // React Query handles errors automatically
    refreshComments,
  };
};

export default useCommentData; 