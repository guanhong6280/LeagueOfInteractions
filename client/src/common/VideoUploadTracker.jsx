import { useEffect } from 'react';
import { fetchVideoById } from '../api/videoApi';
import { useToast } from '../toast/useToast';

const VideoUploadTracker = () => {
  const { success, error } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      // 1. Read IDs from storage
      const raw = localStorage.getItem('pending_uploads');
      if (!raw) return;
      
      let pendingIds = [];
      try {
        pendingIds = JSON.parse(raw);
      } catch (e) {
        return;
      }

      if (!Array.isArray(pendingIds) || pendingIds.length === 0) return;

      const newPendingIds = [...pendingIds];
      let hasChanges = false;

      // 2. Check each ID
      // We use a regular for-loop to handle async/await properly
      for (const id of pendingIds) {
        // Use the centralized API
        const video = await fetchVideoById(id);
        
        if (video) {
          if (video.status === 'ready') {
            success(`Your video "${video.title || 'Interaction'}" is ready!`);
            
            // Remove from list
            const index = newPendingIds.indexOf(id);
            if (index > -1) {
              newPendingIds.splice(index, 1);
              hasChanges = true;
            }
          } 
          else if (video.status === 'failed' || video.status === 'errored') {
            error('One of your video uploads failed to process.');
            
            const index = newPendingIds.indexOf(id);
            if (index > -1) {
              newPendingIds.splice(index, 1);
              hasChanges = true;
            }
          }
        }
      }

      // 3. Update Storage only if we removed items
      if (hasChanges) {
        localStorage.setItem('pending_uploads', JSON.stringify(newPendingIds));
      }
    };

    // Check every 10 seconds (less aggressive than the active page hook)
    const interval = setInterval(checkStatus, 10000);
    
    // Initial check on mount
    checkStatus();

    return () => clearInterval(interval);
  }, [success, error]);

  return null; // It's invisible
};

export default VideoUploadTracker;