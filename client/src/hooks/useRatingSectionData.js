import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChampionSpecificStats } from '../api/championApi';

// Centralize keys (prevents typos, ensures consistent caching)
export const queryKeys = {
  championStats: (championName, include) => ['champion-specific-stats', championName, include ?? 'all'],
};

/**
 * React Query version of useChampionRatingSectionData
 * - Server state (data/loading/error) handled by React Query
 * - UI state (currentSkin) stays local
 */
export const useRatingSectionData = (championId, options = {}) => {

  const include = options?.include ?? 'all';

  const enabled = !!championId;

  const query = useQuery({
    queryKey: queryKeys.championStats(championId, include),
    queryFn: async () => {
      const response = await fetchChampionSpecificStats(championId, include);
      if (!response?.success) {
        // Throwing makes React Query put it into `error`
        throw new Error(response?.message || 'Failed to fetch champion data');
      }
      console.log('response from useRatingSectionData', response);
      return response.data ?? null;
    },
    enabled,

    // Good defaults — tweak later:
    staleTime: 60_000,          // treat as fresh for 1 min
    gcTime: 10 * 60_000,        // keep cached for 10 min after unused
    retry: 2,
    refetchOnWindowFocus: false,

    // Keeps UI from flashing empty when switching params quickly
    // (v5: use placeholderData to keep previous)
    placeholderData: (prev) => prev,
  });

  return useMemo(() => ({
    data: query.data,
    loading: query.isLoading,          // initial load
    fetching: query.isFetching,        // includes background refetch
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }), [query.data, query.isLoading, query.isFetching, query.error, query.refetch]);
};