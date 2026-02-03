import { useState, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  incrementPostView,
  getUserPosts,
} from '../api/discussionApi';
import useCurrentUser from './useCurrentUser';
import { toastMessages, useToast } from '../toast/useToast';

const queryKeys = {
  posts: (filters) => ['patch-discussion-posts', filters],
  post: (postId) => ['patch-discussion-post', postId],
  userPosts: (userId) => ['user-patch-discussion-posts', userId],
};

/**
 * Custom hook for managing patch discussion posts
 * Handles fetching, creating, updating, deleting, and liking posts
 */
const usePostData = (filters = {}) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();
  const likeDebounceMap = useRef(new Map());

  // Fetch all posts with filters
  const {
    data: postsData,
    isLoading,
    error: postsError,
    refetch: refreshPosts,
  } = useQuery({
    queryKey: queryKeys.posts(filters),
    queryFn: async () => {
      const response = await getPosts({
        ...filters,
        includeUserDetails: true,
      });
      // API returns: { success, data: [posts array], nextCursor, count, sortBy }
      if (response.success) {
        return {
          posts: response.data || [],
          hasMore: !!response.nextCursor,
        };
      }
      return { posts: [], hasMore: false };
    },
    staleTime: 30000, // 30 seconds
  });

  const posts = postsData?.posts || [];
  const hasMore = postsData?.hasMore || false;

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData) => createPost(postData),
    
    onSuccess: (response) => {
      if (!response?.success) return;
      
      // Invalidate posts list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      
      if (response.data.status === 'needsReview') {
        info('Your post is pending review.');
      } else if (response.data.status === 'rejected') {
        error('Your post was rejected due to content guidelines.');
      } else {
        success('Post created successfully!');
      }
    },
    
    onError: (err) => {
      error(err.response?.data?.error || 'Failed to create post');
    },
  });

  const submitPost = useCallback(async (postData) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return { success: false };
    }

    try {
      const response = await createPostMutation.mutateAsync(postData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [user, createPostMutation, info]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: ({ postId, updateData }) => updatePost(postId, updateData),
    
    onMutate: async ({ postId, updateData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.post(postId) });
      const previousPost = queryClient.getQueryData(queryKeys.post(postId));

      // Optimistically update the post
      queryClient.setQueryData(queryKeys.post(postId), (oldData) => ({
        ...oldData,
        ...updateData,
        isEdited: true,
      }));

      return { previousPost };
    },
    
    onSuccess: (response, { postId }) => {
      if (!response?.success) return;
      
      queryClient.setQueryData(queryKeys.post(postId), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      success('Post updated successfully!');
    },
    
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.post(variables.postId), context.previousPost);
      }
      error(err.response?.data?.error || 'Failed to update post');
    },
  });

  const updatePostData = useCallback(async (postId, updateData) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return { success: false };
    }

    try {
      const response = await updatePostMutation.mutateAsync({ postId, updateData });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [user, updatePostMutation, info]);

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
    
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() });
      const previousPosts = queryClient.getQueryData(queryKeys.posts(filters));

      // Optimistically remove the post from the list
      queryClient.setQueryData(queryKeys.posts(filters), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          posts: oldData.posts.filter(post => post.id !== postId),
        };
      });

      return { previousPosts };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      success('Post deleted successfully!');
    },
    
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(filters), context.previousPosts);
      }
      error(err.response?.data?.error || 'Failed to delete post');
    },
  });

  const deletePostData = useCallback(async (postId) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return { success: false };
    }

    try {
      await deletePostMutation.mutateAsync(postId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [user, deletePostMutation, info]);

  /**
   * Helper function to update post like state in any query cache
   * This ensures a single source of truth - one function updates all related queries
   */
  const updatePostLikeInCache = useCallback((postId, isCurrentlyLiked) => {
    const updatePostLikeState = (post) => {
      if (!post || post.id !== postId) return post;
      return {
        ...post,
        likedBy: isCurrentlyLiked
          ? post.likedBy.filter(id => id !== user.id)
          : [...(post.likedBy || []), user.id],
        likeCount: isCurrentlyLiked
          ? (post.likeCount || 0) - 1
          : (post.likeCount || 0) + 1,
      };
    };

    // Update all queries that contain this post (single source of truth approach)
    queryClient.setQueriesData(
      // Match any query that starts with 'patch-discussion-post' or 'patch-discussion-posts'
      { 
        predicate: (query) => 
          query.queryKey[0] === 'patch-discussion-post' || 
          query.queryKey[0] === 'patch-discussion-posts'
      },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle posts list format: { posts: [...], hasMore: boolean }
        if (oldData.posts && Array.isArray(oldData.posts)) {
          return {
            ...oldData,
            posts: oldData.posts.map(updatePostLikeState),
          };
        }

        // Handle single post format: { id, title, ... }
        if (oldData.id === postId) {
          return updatePostLikeState(oldData);
        }

        // Handle array of posts format: [...]
        if (Array.isArray(oldData)) {
          return oldData.map(updatePostLikeState);
        }

        return oldData;
      }
    );
  }, [queryClient, user]);

  // Like/Unlike post mutation
  const togglePostLikeMutation = useMutation({
    mutationFn: ({ postId, isCurrentlyLiked }) =>
      isCurrentlyLiked ? unlikePost(postId) : likePost(postId),
    
    onMutate: async ({ postId, isCurrentlyLiked }) => {
      // Cancel all post-related queries to prevent race conditions
      await queryClient.cancelQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'patch-discussion-post' || 
          query.queryKey[0] === 'patch-discussion-posts'
      });
      
      // Store previous state for rollback (capture all affected queries)
      const previousQueries = new Map();
      queryClient.getQueryCache()
        .findAll({ 
          predicate: (query) => 
            query.queryKey[0] === 'patch-discussion-post' || 
            query.queryKey[0] === 'patch-discussion-posts'
        })
        .forEach(query => {
          previousQueries.set(JSON.stringify(query.queryKey), query.state.data);
        });

      // Single source of truth: update all related queries at once
      updatePostLikeInCache(postId, isCurrentlyLiked);

      return { previousQueries };
    },
    
    onSuccess: (response, { postId }) => {
      // Invalidate all post-related queries to refetch fresh data
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'patch-discussion-post' || 
          query.queryKey[0] === 'patch-discussion-posts'
      });
    },
    
    onError: (err, variables, context) => {
      // Rollback all affected queries
      if (context?.previousQueries) {
        queryClient.getQueryCache()
          .findAll({ 
            predicate: (query) => 
              query.queryKey[0] === 'patch-discussion-post' || 
              query.queryKey[0] === 'patch-discussion-posts'
          })
          .forEach(query => {
            const key = JSON.stringify(query.queryKey);
            if (context.previousQueries.has(key)) {
              queryClient.setQueryData(query.queryKey, context.previousQueries.get(key));
            }
          });
      }
    },
  });

  const togglePostLike = useCallback(async (postId, isCurrentlyLiked) => {
    if (!user) {
      info(toastMessages.signIn.info);
      return;
    }

    // Clear existing timeout for this post if any
    if (likeDebounceMap.current.has(postId)) {
      clearTimeout(likeDebounceMap.current.get(postId));
    }

    // Set new debounced timeout
    const timeoutId = setTimeout(async () => {
      try {
        await togglePostLikeMutation.mutateAsync({ postId, isCurrentlyLiked });
      } catch (err) {
        console.error('Failed to toggle post like:', err);
      } finally {
        likeDebounceMap.current.delete(postId);
      }
    }, 300);

    likeDebounceMap.current.set(postId, timeoutId);
  }, [user, togglePostLikeMutation, info]);

  // Increment view count
  const incrementView = useCallback(async (postId) => {
    try {
      await incrementPostView(postId);
    } catch (err) {
      console.error('Failed to increment view:', err);
    }
  }, []);

  return {
    posts,
    hasMore,
    isLoading,
    error: postsError?.message || null,
    isSubmitting: createPostMutation.isPending || updatePostMutation.isPending || deletePostMutation.isPending,
    submitPost,
    updatePost: updatePostData,
    deletePost: deletePostData,
    togglePostLike,
    incrementView,
    refreshPosts,
  };
};

/**
 * Custom hook for fetching a single post by ID
 */
export const usePostById = (postId) => {
  const { incrementView } = usePostData();
  const { user } = useCurrentUser();

  const {
    data: post,
    isLoading,
    error: postError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () => {
      const response = await getPostById(postId);
      if (response.success) {
        // Increment view count when fetching post
        incrementView(postId);
        return response.data;
      }
      return null;
    },
    enabled: !!postId,
    staleTime: 30000,
  });

  const isLiked = useMemo(() => {
    if (!user || !post) return false;
    return post.likedBy?.includes(user.id) || false;
  }, [user, post]);

  const isAuthor = useMemo(() => {
    if (!user || !post) return false;
    return post.userId === user.id;
  }, [user, post]);

  return {
    post,
    isLoading,
    error: postError?.message || null,
    isLiked,
    isAuthor,
    refetch,
  };
};

/**
 * Custom hook for fetching user's own posts
 */
export const useUserPosts = () => {
  const { user } = useCurrentUser();

  const {
    data: posts = [],
    isLoading,
    error: postsError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.userPosts(user?.id),
    queryFn: async () => {
      const response = await getUserPosts();
      return response.success ? response.data : [];
    },
    enabled: !!user,
    staleTime: 30000,
  });

  return {
    posts,
    isLoading,
    error: postsError?.message || null,
    refetch,
  };
};

export default usePostData;
