import api from './apiClient';

export const getCommentModerationQueue = async (params = {}) => {
  const response = await api.get('/api/moderation/comments', { params });
  return response.data;
};

export const getCommentModerationSummary = async (type) => {
  const params = type ? { type } : {};
  const response = await api.get('/api/moderation/comments/summary', { params });
  return response.data;
};

export const approveCommentModeration = async (commentId, payload = {}) => {
  const { type, ...body } = payload;
  const params = type ? { type } : {};
  const response = await api.post(`/api/moderation/comments/${commentId}/approve`, body, { params });
  return response.data;
};

export const rejectCommentModeration = async (commentId, payload = {}) => {
  const { type, ...body } = payload;
  const params = type ? { type } : {};
  const response = await api.post(`/api/moderation/comments/${commentId}/reject`, body, { params });
  return response.data;
};

// Post moderation APIs
export const getPostModerationQueue = async (params = {}) => {
  const response = await api.get('/api/moderation/posts', { params });
  return response.data;
};

export const getPostModerationSummary = async () => {
  const response = await api.get('/api/moderation/posts/summary');
  return response.data;
};

export const approvePostModeration = async (postId, payload = {}) => {
  const response = await api.post(`/api/moderation/posts/${postId}/approve`, payload);
  return response.data;
};

export const rejectPostModeration = async (postId, payload = {}) => {
  const response = await api.post(`/api/moderation/posts/${postId}/reject`, payload);
  return response.data;
};

export const getVideoModerationQueue = async () => {
  const response = await api.get('/api/moderation/videos');
  return response.data;
};

export const getVideoModerationSummary = async () => {
  const response = await api.get('/api/moderation/videos/summary');
  return response.data;
};

export const approveVideoModeration = async (videoId, payload = {}) => {
  const response = await api.post(`/api/moderation/videos/${videoId}/approve`, payload);
  return response.data;
};

export const rejectVideoModeration = async (videoId, payload = {}) => {
  const response = await api.post(`/api/moderation/videos/${videoId}/reject`, payload);
  return response.data;
};
