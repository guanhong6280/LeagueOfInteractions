import { useQuery } from '@tanstack/react-query';
import { fetchChampionStats } from '../api/championApi';

const useChampionStats = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['champion-stats'],
    queryFn: async () => {
      // The API now returns a normalized envelope { success, data }
      const response = await fetchChampionStats();
      console.log(response);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch champion stats');
      }
      return response.data;
    },
    // Keep data fresh for 2 minutes since this is heavy and mostly static
    staleTime: 2 * 60 * 1000,
    // Don't refetch on window focus to avoid partial re-renders/jank
    refetchOnWindowFocus: false,
    // Keep previous data while fetching new data to avoid flash of loading
    keepPreviousData: true,
  });

  return {
    stats: data || {}, // Provide safe default
    isLoading,
    isFetching,
    error,
    // Expose refetch directly; no need for a manual "refreshAllStats" wrapper
    refreshAllStats: refetch,
  };
};

export { useChampionStats };
