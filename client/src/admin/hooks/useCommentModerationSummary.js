import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCommentModerationSummary } from '../../api/moderationApi';

const DEFAULT_STALE_TIME = 60_000;

export const commentSummaryQueryKey = (type = 'skin') => [
  'admin',
  'moderation',
  'comment-summary',
  type,
];

const normalizeResponse = (data, type) => {
  const payload = data?.data || {};
  return {
    total: payload.total ?? 0,
    pending: payload.needsReview ?? 0,
    approved: payload.approved ?? 0,
    rejected: payload.rejected ?? 0,
    subjectType: payload.subjectType ?? type,
  };
};

const defaultOptions = {
  staleTime: DEFAULT_STALE_TIME,
  cacheTime: DEFAULT_STALE_TIME * 5,
  refetchOnWindowFocus: false,
};

const useCommentModerationSummary = (type = 'skin', options = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: commentSummaryQueryKey(type),
    queryFn: () => getCommentModerationSummary(type),
    ...defaultOptions,
    ...options,
    enabled: !!type,
  });

  const summary = useMemo(() => {
    return normalizeResponse(query.data, type);
  }, [query.data, type]);

  const refresh = useCallback(
    (invalidate = false) => {
      if (invalidate) {
        return queryClient.invalidateQueries(commentSummaryQueryKey(type));
      }
      return query.refetch();
    },
    [query.refetch, queryClient, type]
  );

  return {
    ...query,
    ...summary,
    refresh,
  };
};

export default useCommentModerationSummary;

