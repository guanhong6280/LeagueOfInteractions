import { useCallback, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  approveCommentModeration,
  getCommentModerationQueue,
  rejectCommentModeration,
} from '../../api/moderationApi';

const COMMENT_TYPES = ['skin', 'champion', 'post'];

/**
 * Custom hook for managing comment moderation
 * Supports skin, champion, and post comment types
 */
const useCommentModeration = (initialType = 'skin') => {
  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(
    COMMENT_TYPES.indexOf(initialType) >= 0 ? COMMENT_TYPES.indexOf(initialType) : 0
  );
  const [pendingActionId, setPendingActionId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const currentType = COMMENT_TYPES[tabIndex] || 'skin';

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setTabIndex(newValue);
  }, []);

  const removeCommentFromCache = useCallback(
    (commentId) => {
      queryClient.setQueryData(['moderation', 'comments', currentType], (oldData) => {
        if (!oldData) return oldData;
        const nextPages = oldData.pages.map((page) => ({
          ...page,
          data: (page?.data || []).filter(
            (comment) => comment.commentId !== commentId
          ),
        }));

        return { ...oldData, pages: nextPages };
      });
    },
    [queryClient, currentType]
  );

  // Infinite query for comments
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
    queryKey: ['moderation', 'comments', currentType],
    queryFn: ({ pageParam }) =>
      getCommentModerationQueue({
        cursor: pageParam,
        type: currentType,
      }),
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor,
    refetchOnWindowFocus: false,
  });

  const comments = useMemo(
    () =>
      data?.pages?.flatMap((page) => (page?.data ? page.data : [])) ?? [],
    [data]
  );

  const thresholds = data?.pages?.[0]?.thresholds;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ commentId, note = '' }) =>
      approveCommentModeration(commentId, { note, type: currentType }),
    onMutate: ({ commentId }) => {
      setPendingActionId(commentId);
    },
    onSuccess: (_, { commentId }) => {
      removeCommentFromCache(commentId);
      setSnackbar({
        open: true,
        message: 'Comment approved successfully.',
        severity: 'success',
      });
      refetch();
    },
    onError: (mutationError) => {
      setSnackbar({
        open: true,
        message:
          mutationError?.response?.data?.error ||
          'Failed to approve comment. Please try again.',
        severity: 'error',
      });
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ commentId, note = '' }) =>
      rejectCommentModeration(commentId, { note, type: currentType }),
    onMutate: ({ commentId }) => {
      setPendingActionId(commentId);
    },
    onSuccess: (_, { commentId }) => {
      removeCommentFromCache(commentId);
      setSnackbar({
        open: true,
        message: 'Comment rejected.',
        severity: 'info',
      });
      refetch();
    },
    onError: (mutationError) => {
      setSnackbar({
        open: true,
        message:
          mutationError?.response?.data?.error ||
          'Failed to reject comment. Please try again.',
        severity: 'error',
      });
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const handleApprove = useCallback(
    (commentId, note = '') => {
      approveMutation.mutate({ commentId, note });
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (commentId, note = '') => {
      rejectMutation.mutate({ commentId, note });
    },
    [rejectMutation]
  );

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return {
    // State
    tabIndex,
    currentType,
    comments,
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
    handleTabChange,
    handleApprove,
    handleReject,
    refetch,
    closeSnackbar,
    
    // Constants
    commentTypes: COMMENT_TYPES,
  };
};

export default useCommentModeration;
