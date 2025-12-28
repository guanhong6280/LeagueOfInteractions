// hooks/useVideoActions.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleVideoLike, incrementVideoView } from '../api/videoApi';
import { useToast } from '../toast/useToast';
import { toastMessages } from '../toast/useToast';

export const useVideoActions = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  // 1. View Increment Mutation (Fire & Forget)
  const viewMutation = useMutation({
    mutationFn: (videoId) => incrementVideoView(videoId),
    onSuccess: (data, videoId) => {

      queryClient.setQueriesData({ queryKey: ['interaction-video'] }, (oldData) => {
        // Only update if the currently viewed video matches
        if (!oldData || oldData._id !== videoId) return oldData;
        return { ...oldData, views: (oldData.views || 0) + 1 };
      });
    }
  });

  // 2. Like Toggle Mutation (Optimistic Update)
  const likeMutation = useMutation({
    mutationFn: (videoId) => toggleVideoLike(videoId),
    onSuccess: (data, videoId) => {
      // data contains the NEW { likes, isLiked } from server
      if (data.isLiked) {
        success(toastMessages.video.like_success);
      } else {
        success(toastMessages.video.unlike_success);
      }
      // Update the 'interaction-video' query cache directly
      // This matches the key used in ViewInteractions.jsx
      queryClient.setQueriesData({ queryKey: ['interaction-video'] }, (oldData) => {
        if (!oldData || oldData._id !== videoId) return oldData;
        
        return {
          ...oldData,
          likes: data.likes,
          isLiked: data.isLiked
        };
      });
    },
    onError: (error) => {
      error(toastMessages.video.like_error);
    }
  });

  return {
    incrementView: viewMutation.mutate,
    toggleLike: likeMutation.mutateAsync, // Async allows handling errors in UI if needed
    isLiking: likeMutation.isPending
  };
};