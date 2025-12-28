import { useQuery } from '@tanstack/react-query';
import { fetchChampionDetails } from '../api/championApi';

export const useChampionDetails = (championName) => {
  return useQuery({
    queryKey: ['champion-details', championName],
    queryFn: () => fetchChampionDetails(championName),
    enabled: !!championName, // Only fetch if we have a name
    staleTime: 1000 * 60 * 60, // Cache data for 1 hour
    retry: 1,
  });
};