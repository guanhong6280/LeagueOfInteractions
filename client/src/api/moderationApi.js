import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5174',
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/google';
    }
    return Promise.reject(error);
  }
);

export const getCommentModerationQueue = async (params = {}) => {
  const response = await api.get('/api/moderation/comments', { params });
  return response.data;
};

export const approveCommentModeration = async (commentId, payload = {}) => {
  const response = await api.post(`/api/moderation/comments/${commentId}/approve`, payload);
  return response.data;
};

export const rejectCommentModeration = async (commentId, payload = {}) => {
  const response = await api.post(`/api/moderation/comments/${commentId}/reject`, payload);
  return response.data;
};

export const getVideoModerationQueue = async () => {
  const response = await api.get('/api/videos/admin/pending');
  return response.data;
};

export const approveVideoModeration = async (videoId, payload = {}) => {
  const response = await api.post(`/api/videos/admin/${videoId}/approve`, payload);
  return response.data;
};

export const rejectVideoModeration = async (videoId, payload = {}) => {
  const response = await api.post(`/api/videos/admin/${videoId}/reject`, payload);
  return response.data;
};


