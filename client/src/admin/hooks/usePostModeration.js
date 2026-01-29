import { useCallback, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  approvePostModeration,
  getPostModerationQueue,
  rejectPostModeration,
} from '../../api/moderationApi';

/**
 * Custom hook for managing post moderation
 */
const usePostModeration = () => {
  const queryClient = useQueryClient();
  const [pendingActionId, setPendingActionId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const removePostFromCache = useCallback(
    (postId) => {
      queryClient.setQueryData(['moderation', 'posts'], (oldData) => {
        if (!oldData) return oldData;
        const nextPages = oldData.pages.map((page) => ({
          ...page,
          data: (page?.data || []).filter(
            (post) => post.postId !== postId
          ),
        }));

        return { ...oldData, pages: nextPages };
      });
    },
    [queryClient]
  );

  // Infinite query for posts
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['moderation', 'posts'],
    queryFn: ({ pageParam }) =>
      getPostModerationQueue({
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor,
    refetchOnWindowFocus: false,
  });

  const posts = useMemo(
    () =>
      data?.pages?.flatMap((page) => (page?.data ? page.data : [])) ?? [],
    [data]
  );

  const thresholds = data?.pages?.[0]?.thresholds;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ postId, note = '' }) =>
      approvePostModeration(postId, { note }),
    onMutate: ({ postId }) => {
      setPendingActionId(postId);
    },
    onSuccess: (_, { postId }) => {
      removePostFromCache(postId);
      setSnackbar({
        open: true,
        message: 'Post approved successfully.',
        severity: 'success',
      });
      refetch();
    },
    onError: (mutationError) => {
      setSnackbar({
        open: true,
        message:
          mutationError?.response?.data?.error ||
          'Failed to approve post. Please try again.',
        severity: 'error',
      });
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ postId, note = '' }) =>
      rejectPostModeration(postId, { note }),
    onMutate: ({ postId }) => {
      setPendingActionId(postId);
    },
    onSuccess: (_, { postId }) => {
      removePostFromCache(postId);
      setSnackbar({
        open: true,
        message: 'Post rejected.',
        severity: 'info',
      });
      refetch();
    },
    onError: (mutationError) => {
      setSnackbar({
        open: true,
        message:
          mutationError?.response?.data?.error ||
          'Failed to reject post. Please try again.',
        severity: 'error',
      });
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const handleApprove = useCallback(
    (postId, note = '') => {
      approveMutation.mutate({ postId, note });
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (postId, note = '') => {
      rejectMutation.mutate({ postId, note });
    },
    [rejectMutation]
  );

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return {
    // State
    posts,
    thresholds,
    pendingActionId,
    snackbar,
    
    // Loading states
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    isMutating,
    
    // Pagination
    hasNextPage,
    fetchNextPage,
    
    // Actions
    handleApprove,
    handleReject,
    refetch,
    closeSnackbar,
  };
};

export default usePostModeration;
