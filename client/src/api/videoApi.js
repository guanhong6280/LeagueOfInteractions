// api/videoApi.js
import api from './apiClient';

export const fetchVideoData = async (params) => {
  try {
    const response = await api.get('/api/videos', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching video data:', error);
    return null;
  }
};

export const fetchVideoById = async (videoId) => {
  if (!videoId) return null;
  try {
    const response = await api.get(`/api/videos/${videoId}`);
    return response.data;
  } catch (error) {
    // ✅ Change: check if it's a 404 (Not Found)
    if (error.response && error.response.status === 404) {
      // Throw a specific error object we can identify later
      throw { status: 404, message: 'Video not found' };
    }
    // For other errors, log and rethrow or return null
    console.error('Error fetching video by ID:', error);
    throw error; 
  }
};

export const toggleVideoLike = async (videoId) => {
  try {
    const response = await api.post(`/api/videos/${videoId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error toggling video like:', error);
    throw error;
  }
};

export const initMuxUpload = async (payload) => {
  try {
    const response = await api.post('/api/videos/upload/init', payload);
    return response.data; // { uploadUrl, videoId }
  } catch (error) {
    console.error('Error initializing Mux upload:', error);
    throw error;
  }
};

export const incrementVideoView = async (videoId) => {
  const response = await api.post(`/api/videos/${videoId}/view`);
  return response.data;
};