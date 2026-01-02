import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUserActivity } from '../api/userApi';

const useUserActivityTimeline = ({
  userId,
  activityType = 'all',
  limit = 20,
}) => {
  const queryKey = useMemo(
    () => ['user-activity', userId, activityType, limit],
    [userId, activityType, limit]
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getUserActivity(userId, {
        type: activityType,
        limit,
      });
      return response?.data || [];
    },
    enabled: !!userId,
    // Smooth UI when switching filters: keep old list while new list loads
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: 2,
  });

  return {
    // Server state
    activities: data || [],
    loading: isLoading,
    isFetching,
    error,
    refetch,
  };
};

export default useUserActivityTimeline;

