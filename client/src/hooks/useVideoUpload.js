import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UpChunk } from '@mux/upchunk';
import axios from 'axios';
import { initMuxUpload } from '../api/videoApi'; 
import { useToast, toastMessages } from '../toast/useToast'; 

// --- Helper: Add to Local Storage ---
const addPendingUpload = (videoId) => {
  if (!videoId) return;
  try {
    const raw = localStorage.getItem('pending_uploads');
    const pending = raw ? JSON.parse(raw) : [];
    
    if (!pending.includes(videoId)) {
      pending.push(videoId);
      localStorage.setItem('pending_uploads', JSON.stringify(pending));
      // Notify other tabs/components
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error("Error saving to local storage", err);
  }
};

// --- Helper: Remove from Local Storage ---
const removePendingUpload = (videoId) => {
  if (!videoId) return;
  try {
    const raw = localStorage.getItem('pending_uploads');
    if (!raw) return;
    
    const pending = JSON.parse(raw);
    const index = pending.indexOf(videoId);
    
    if (index > -1) {
      pending.splice(index, 1);
      localStorage.setItem('pending_uploads', JSON.stringify(pending));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error("Error removing from local storage", err);
  }
};

// --- Helper: TUS Upload Logic (Restored) ---
const uploadWithTus = (file, endpoint, onProgress) => {
  return new Promise((resolve, reject) => {
    // Create the upload instance
    const upload = UpChunk.createUpload({
      endpoint,
      file,
      chunkSize: 5120, // 5MB chunks
    });

    // Listen for progress events
    upload.on('progress', (evt) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.floor(evt.detail));
      }
    });

    // Listen for completion
    upload.on('success', () => {
      resolve();
    });

    // Listen for errors
    upload.on('error', (err) => {
      reject(err?.detail || err);
    });
  });
};

// --- Main Hook ---
export const useVideoUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  
  const { success, error } = useToast();

  const resetUpload = () => {
    // Clean up storage if resetting
    if (uploadedVideoId) {
      removePendingUpload(uploadedVideoId);
    }
    setUploadedVideoId(null);
    setUploadProgress(0);
  };

  const mutation = useMutation({
    mutationFn: async ({ file, videoLink, metadata }) => {
      // Reset state on new upload start
      setUploadProgress(0);
      setUploadedVideoId(null);

      // --- SCENARIO A: File Upload (TUS) ---
      if (file) {
        const initPayload = {
          ...metadata, 
          corsOrigin: window.location.origin,
        };

        // 1. Get URL and ID from backend
        const { uploadUrl, videoId } = await initMuxUpload(initPayload);

        // Store ID so we can track it, but the video isn't "Ready" yet
        setUploadedVideoId(videoId);

        // 2. Perform the heavy upload (AND WAIT FOR IT)
        // ✅ CRITICAL: The 'await' here prevents the "Success" toast from firing instantly
        await uploadWithTus(file, uploadUrl, (percent) => {
          setUploadProgress(percent);
        });

        return { success: true, type: 'file', videoId };
      }

      // --- SCENARIO B: Link Upload ---
      else if (videoLink) {
        const payload = {
          ...metadata,
          videoURL: videoLink,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/videos/upload`,
          payload,
          { withCredentials: true }
        );

        // Return data for onSuccess
        return { success: true, type: 'link', videoId: response.data._id || response.data.video._id };
      }

      throw new Error('No file or link provided');
    },

    // Global Success Handler
    onSuccess: (data) => {
      success(toastMessages.addInteraction.success);
      
      // Add to tracker so it persists if the user leaves the page
      if (data.videoId) {
        addPendingUpload(data.videoId);
      }
    },

    // Global Error Handler
    onError: (err) => {
      console.error('Upload failed:', err);
      error(toastMessages.addInteraction.error);
    }
  });

  return {
    ...mutation,
    uploadProgress,
    uploadedVideoId, 
    resetUpload,
  };
};