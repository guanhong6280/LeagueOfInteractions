import { useEffect } from 'react'; // Don't forget to import useEffect
import { useQuery } from '@tanstack/react-query';
import { fetchVideoById } from '../api/videoApi';

// Accept a 'onReset' callback
export const useServerStatus = (videoId, onReset, interval = 3000, shouldPoll = true) => {
  const query = useQuery({
    queryKey: ['videoStatus', videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId && shouldPoll,
    refetchInterval: (data) => {
      // Stop polling if complete
      if (data?.status === 'ready' || data?.status === 'failed') {
        return false; 
      }
      return interval;
    },
    refetchIntervalInBackground: true,
  });

  // ✅ New Logic: Auto-clear ID after completion
  useEffect(() => {
    // Check for 404 error
    if (query.error && query.error.status === 404) {
       if (onReset) onReset();
    }

    const status = query.data?.status;
    if (status === 'ready' || status === 'failed' || status === 'errored') {
      const timer = setTimeout(() => {
        if (onReset) onReset(); 
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [query.data, query.error, onReset]);

  return query;
};