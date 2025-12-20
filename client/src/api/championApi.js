import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5174', // Backend server URL
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  // Add any auth headers if needed
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/auth/google';
    }
    return Promise.reject(error);
  }
);

// Champion API functions
export const fetchChampionNames = async () => {
  const response = await api.get('/api/championData/champion_data');
  return response.data;
};

export const fetchCurrentVersion = async () => {
  try {
    const response = await api.get('/api/championData/version/current');
    return response.data.version;
  } catch (error) {
    console.error('Error fetching current version:', error);
    return '14.19.1'; // Fallback version
  }
};

export const fetchChampionList = async () => {
  const response = await api.get('/api/championData/simplified_champion_data');
  return response.data;
};

export const fetchChampionDetails = async (championName) => {
  try {
    const response = await api.get(`/api/championData/champion/${championName}`);
    console.log('Champion details from server:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching champion details:', error);
    return null;
  }
};

export const fetchChampionSkins = async (championName) => {
  const response = await api.get(`/api/championData/${championName}/skins`);
  return response.data;
};

export const fetchSkinDetails = async (skinId) => {
  const response = await api.get(`/api/skins/${skinId}`);
  return response.data;
};

export const fetchChampionSkinsFromAPI = async (championName) => {
  const response = await api.get(`/api/skins?championId=${encodeURIComponent(championName)}`);
  return response.data;
};

// Video API functions
export const fetchVideoData = async (params) => {
  try {
    const response = await api.get('/api/videos', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching video data:', error);
    return null;
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

// Skin Rating APIs
export const submitSkinRating = async (skinId, ratingData) => {
  const response = await api.post(`/api/skins/${skinId}/rate`, ratingData);
  return response.data;
};

export const getSkinRatings = async (skinId, includeUserDetails = false) => {
  const response = await api.get(`/api/skins/${skinId}/ratings?includeUserDetails=${includeUserDetails}`);
  return response.data;
};

export const getUserSkinRating = async (skinId) => {
  const response = await api.get(`/api/skins/${skinId}/ratings/user`);
  return response.data;
};

// Champion Rating APIs
export const submitChampionRating = async (championId, ratingData) => {
  const response = await api.post(`/api/champions/${championId}/rate`, ratingData);
  return response.data;
};

export const getChampionRatings = async (championId, includeUserDetails = false) => {
  const response = await api.get(`/api/champions/${championId}/ratings?includeUserDetails=${includeUserDetails}`);
  return response.data;
};

export const getUserChampionRating = async (championId) => {
  const response = await api.get(`/api/champions/${championId}/ratings/user`);
  return response.data;
};

// Skin Comment APIs
export const submitSkinComment = async (skinId, commentData) => {
  const response = await api.post(`/api/skins/${skinId}/comment`, commentData);
  return response.data;
};

export const getSkinComments = async (
  skinId,
  { includeUserDetails = false, limit, cursor, withCount } = {}
) => {
  const params = {
    includeUserDetails,
  };
  if (limit !== undefined) params.limit = limit;
  if (cursor) params.cursor = cursor;
  if (withCount !== undefined) params.withCount = withCount;

  const response = await api.get(`/api/skins/${skinId}/comments`, { params });
  return response.data;
};

export const getUserSkinComment = async (skinId) => {
  const response = await api.get(`/api/skins/${skinId}/comments/user`);
  return response.data;
};

// Comment Like/Unlike APIs
export const likeComment = async (skinId, commentId) => {
  const response = await api.post(`/api/skins/${skinId}/comments/${commentId}/like`);
  return response.data;
};

export const unlikeComment = async (skinId, commentId) => {
  const response = await api.post(`/api/skins/${skinId}/comments/${commentId}/unlike`);
  return response.data;
};

// Delete Comment API
export const deleteSkinComment = async (skinId, commentId) => {
  const response = await api.delete(`/api/skins/${skinId}/comments/${commentId}`);
  return response.data;
};

// Reply APIs
export const addReply = async (skinId, commentId, replyData) => {
  const response = await api.post(`/api/skins/${skinId}/comments/${commentId}/replies`, replyData);
  return response.data;
};

export const getRepliesForComment = async (
  skinId,
  commentId,
  { includeUserDetails = false, limit, cursor, withCount } = {}
) => {
  const params = { includeUserDetails };
  if (limit !== undefined) params.limit = limit;
  if (cursor) params.cursor = cursor;
  if (withCount !== undefined) params.withCount = withCount;

  const response = await api.get(`/api/skins/${skinId}/comments/${commentId}/replies`, { params });
  return response.data;
};

// Reply Like/Unlike APIs
export const likeReply = async (skinId, commentId, replyId) => {
  const response = await api.post(`/api/skins/${skinId}/comments/${commentId}/replies/${replyId}/like`);
  return response.data;
};

export const unlikeReply = async (skinId, commentId, replyId) => {
  const response = await api.post(`/api/skins/${skinId}/comments/${commentId}/replies/${replyId}/unlike`);
  return response.data;
};

// Delete Reply API
export const deleteSkinReply = async (skinId, commentId, replyId) => {
  const response = await api.delete(`/api/skins/${skinId}/comments/${commentId}/replies/${replyId}`);
  return response.data;
};

export const fetchChampionStats = async () => {
  const response = await api.get('/api/champion-stats/stats');
  return response.data;
};

export const fetchChampionSpecificStats = async (championName, include) => {
  const queryParams = include ? `?include=${include}` : '';
  const response = await api.get(`/api/champion-stats/${encodeURIComponent(championName)}/stats${queryParams}`);
  return response.data;
};

// Champion Comment APIs
export const submitChampionComment = async (championId, commentData) => {
  const response = await api.post(`/api/champions/${championId}/comments`, commentData);
  return response.data;
};

export const getChampionComments = async (
  championId,
  { includeUserDetails = false, limit, cursor, withCount } = {}
) => {
  const params = { includeUserDetails, };
  if (limit !== undefined) params.limit = limit;
  if (cursor) params.cursor = cursor;
  if (withCount !== undefined) params.withCount = withCount;

  const response = await api.get(`/api/champions/${championId}/comments`, { params });
  return response.data;
};

export const getUserChampionComment = async (championId) => {
  const response = await api.get(`/api/champions/${championId}/comments/user`);
  return response.data;
};

// Champion Comment Like/Unlike APIs
export const likeChampionComment = async (championId, commentId) => {
  const response = await api.post(`/api/champions/${championId}/comments/${commentId}/like`);
  return response.data;
};

export const unlikeChampionComment = async (championId, commentId) => {
  const response = await api.post(`/api/champions/${championId}/comments/${commentId}/unlike`);
  return response.data;
};

// Delete Champion Comment API
export const deleteChampionComment = async (championId, commentId) => {
  const response = await api.delete(`/api/champions/${championId}/comments/${commentId}`);
  return response.data;
};

// Champion Reply APIs
export const addChampionReply = async (championId, commentId, replyData) => {
  const response = await api.post(`/api/champions/${championId}/comments/${commentId}/replies`, replyData);
  return response.data;
};

export const getChampionRepliesForComment = async (
  championId,
  commentId,
  { includeUserDetails = false, limit, cursor, withCount } = {}
) => {
  const params = { includeUserDetails };
  if (limit !== undefined) params.limit = limit;
  if (cursor) params.cursor = cursor;
  if (withCount !== undefined) params.withCount = withCount;

  const response = await api.get(`/api/champions/${championId}/comments/${commentId}/replies`, { params });
  return response.data;
};

// Champion Reply Like/Unlike APIs
export const likeChampionReply = async (championId, commentId, replyId) => {
  const response = await api.post(`/api/champions/${championId}/comments/${commentId}/replies/${replyId}/like`);
  return response.data;
};

export const unlikeChampionReply = async (championId, commentId, replyId) => {
  const response = await api.post(`/api/champions/${championId}/comments/${commentId}/replies/${replyId}/unlike`);
  return response.data;
};

// Delete Champion Reply API
export const deleteChampionReply = async (championId, commentId, replyId) => {
  const response = await api.delete(`/api/champions/${championId}/comments/${commentId}/replies/${replyId}`);
  return response.data;
};
