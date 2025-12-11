import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getVideoModerationSummary } from '../../api/moderationApi';

const DEFAULT_STALE_TIME = 60_000;

export const videoSummaryQueryKey = ['admin', 'moderation', 'video-summary'];

const normalizeResponse = (data) => {
  const payload = data?.data || {};
  return {
    total: payload.total ?? 0,
    pending: payload.pending ?? 0,
    approved: payload.approved ?? 0,
    rejected: payload.rejected ?? 0,
  };
};

const defaultOptions = {
  staleTime: DEFAULT_STALE_TIME,
  cacheTime: DEFAULT_STALE_TIME * 5,
  refetchOnWindowFocus: false,
};

const useVideoModerationSummary = (options = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: videoSummaryQueryKey,
    queryFn: getVideoModerationSummary,
    ...defaultOptions,
    ...options,
  });

  const summary = useMemo(() => normalizeResponse(query.data), [query.data]);

  const refresh = useCallback(
    (invalidate = false) => {
      if (invalidate) {
        return queryClient.invalidateQueries(videoSummaryQueryKey);
      }
      return query.refetch();
    },
    [query.refetch, queryClient]
  );

  return {
    ...query,
    ...summary,
    refresh,
  };
};

export default useVideoModerationSummary;

