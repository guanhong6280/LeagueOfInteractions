import { useState, useEffect, useCallback } from 'react';
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
  
  // Core state
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // UI state
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(new Set());

  // Load comments and user's comment
  const loadCommentData = useCallback(async () => {
    if (!currentSkinId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load all comments and user's comment in parallel
      const [commentsResponse, userCommentResponse] = await Promise.all([
        getSkinComments(currentSkinId, true), // Include user details
        user ? getUserSkinComment(currentSkinId) : Promise.resolve({ data: null })
      ]);

      if (commentsResponse.success) {
        // Transform comments to include display text based on moderation status
        const transformedComments = commentsResponse.data.map(comment => ({
          ...comment,
          displayText: comment.status === 'needsReview' 
            ? "This comment is under review" 
            : comment.status === 'rejected'
            ? "I love league of legend, I love Riot Games!!!"
            : comment.comment,
          isInteractionDisabled: comment.status === 'needsReview' || comment.status === 'rejected'
        }));
        setComments(transformedComments);
      }

      if (userCommentResponse.success && userCommentResponse.data) {
        setUserComment(userCommentResponse.data);
      }

    } catch (err) {
      setError('Failed to load comments');
      console.error('Error loading comment data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSkinId, user]);

  // Submit or update comment
  const submitComment = useCallback(async (commentText) => {
    if (!user) {
      setError('Please sign in to comment');
      return { success: false, message: 'Authentication required' };
    }

    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return { success: false, message: 'Comment cannot be empty' };
    }

    if (commentText.length > 1000) {
      setError('Comment cannot exceed 1000 characters');
      return { success: false, message: 'Comment too long' };
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await submitSkinComment(currentSkinId, { comment: commentText.trim() });

      if (response.success) {
        const submittedComment = response.data;
        console.log(submittedComment);
        // Handle different moderation statuses
        if (submittedComment.status === 'rejected') {
          setError('Your comment was rejected due to inappropriate content. Please revise and try again.');
          return { success: false, message: 'Comment rejected', status: 'rejected' };
        }

        // Update user's comment state
        setUserComment(submittedComment);

        // Add/update comment in the list
        const commentForList = {
          ...submittedComment,
          displayText: submittedComment.status === 'needsReview' 
            ? "This comment is under review" 
            : submittedComment.status === 'rejected'
            ? "I love league of legend, I love Riot Games!!!"
            : submittedComment.comment,
          isInteractionDisabled: submittedComment.status === 'rejected' || submittedComment.status === 'needsReview',
          user: { // Mock user object for display
            username: user.username,
            profilePictureURL: user.profilePictureURL
          }
        };
        console.log(commentForList);
        setComments(prevComments => {
          // Check if user already has a comment (update case)
          const existingIndex = prevComments.findIndex(c => c.user._id === user._id);
          if (existingIndex !== -1) {
            const updated = [...prevComments];
            updated[existingIndex] = commentForList;
            return updated;
          } else {
            // New comment - add to the beginning
            return [commentForList, ...prevComments];
          }
        });

        const successMessage = submittedComment.status === 'needsReview'
          ? 'Your comment will be reviewed before being displayed.'
          : userComment ? 'Comment updated successfully.' : 'Comment submitted successfully.';

        return { 
          success: true, 
          message: successMessage,
          status: submittedComment.status 
        };
      }

      setError('Failed to submit comment');
      return { success: false, message: 'Failed to submit comment' };

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit comment';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSkinId, user, userComment]);

  // Like/unlike comment with optimistic updates
  const toggleCommentLike = useCallback(async (commentId, isCurrentlyLiked) => {
    if (!user) {
      setError('Please sign in to like comments');
      return;
    }

    // Optimistic update
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment._id === commentId) {
          const newLikedBy = isCurrentlyLiked
            ? comment.likedBy.filter(id => id !== user._id)
            : [...comment.likedBy, user._id];
          
          return {
            ...comment,
            likedBy: newLikedBy
          };
        }
        return comment;
      })
    );

    try {
      const response = isCurrentlyLiked 
        ? await unlikeComment(currentSkinId, commentId)
        : await likeComment(currentSkinId, commentId);

      if (!response.success) {
        // Revert optimistic update on failure
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment._id === commentId) {
              const revertedLikedBy = isCurrentlyLiked
                ? [...comment.likedBy, user._id]
                : comment.likedBy.filter(id => id !== user._id);
              
              return {
                ...comment,
                likedBy: revertedLikedBy
              };
            }
            return comment;
          })
        );
        setError('Failed to update like');
      }
    } catch (err) {
      // Revert on error
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            const revertedLikedBy = isCurrentlyLiked
              ? [...comment.likedBy, user._id]
              : comment.likedBy.filter(id => id !== user._id);
            
            return {
              ...comment,
              likedBy: revertedLikedBy
            };
          }
          return comment;
        })
      );
      setError('Failed to update like');
    }
  }, [currentSkinId, user]);

  // Load replies for a comment (lazy loading)
  const loadReplies = useCallback(async (commentId) => {
    // Don't reload if already loading or already have replies
    const comment = comments.find(c => c._id === commentId);
    console.log("before loadReplies");
    console.log(comment);
    
    if (loadingReplies.has(commentId) || (comment?.replies && comment.replies.length > 0)) {
      return;
    }

    setLoadingReplies(prev => new Set([...prev, commentId]));
    setError(null);

    try {
      const response = await getRepliesForComment(currentSkinId, commentId, true);
      if (response.success) {
        // Transform replies to include display text based on moderation status
        const transformedReplies = response.data.map(reply => ({
          ...reply,
          displayText: reply.status === 'needsReview' 
            ? "This reply is under review" 
            : reply.status === 'rejected'
            ? "I love league of legend, I love Riot Games!!!"
            : reply.comment,
          isInteractionDisabled: reply.status === 'needsReview'
        }));

        // Update the comment with loaded replies
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? { ...comment, replies: transformedReplies }
              : comment
          )
        );
      }

    } catch (err) {
      console.error('Error loading replies:', err);
      setError('Failed to load replies');
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  }, [currentSkinId, comments, loadingReplies]);

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

  // Submit reply
  const submitReply = useCallback(async (commentId, replyText) => {
    if (!user) {
      setError('Please sign in to reply');
      return { success: false };
    }

    if (!replyText.trim()) {
      setError('Reply cannot be empty');
      return { success: false };
    }

    if (replyText.length > 500) {
      setError('Reply cannot exceed 500 characters');
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await addReply(currentSkinId, commentId, { comment: replyText.trim() });

      if (response.success) {
        const newReply = {
          ...response.data,
          displayText: response.data.status === 'needsReview' 
            ? "This reply is under review" 
            : response.data.status === 'rejected'
            ? "I love league of legend, I love Riot Games!!!"
            : response.data.comment,
          isInteractionDisabled: response.data.status === 'needsReview',
          // Transform user data to match expected format
          userId: {
            _id: user._id,
            username: user.username,
            profilePictureURL: user.profilePictureURL
          }
        };

        // Add reply to the comment
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            return comment;
          })
        );

        // Expand replies and cancel reply mode
        setExpandedReplies(prev => new Set([...prev, commentId]));
        setReplyingTo(null);

        const successMessage = response.data.status === 'needsReview'
          ? 'Your reply will be reviewed before being displayed.'
          : 'Reply submitted successfully.';

        return { success: true, message: successMessage };
      }

      setError('Failed to submit reply');
      return { success: false };

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit reply';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSkinId, user]);



  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load data when skinId changes
  useEffect(() => {
    loadCommentData();
  }, [loadCommentData]);

  return {
    // Data
    comments,
    userComment,
    
    // Loading states
    isLoading,
    isSubmitting,
    error,
    
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
    clearError,
    refreshComments: loadCommentData,
  };
};

export default useCommentData; 