import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5174', // Backend server URL
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

// Skin Comment APIs
export const submitSkinComment = async (skinId, commentData) => {
  const response = await api.post(`/api/skins/${skinId}/comment`, commentData);
  return response.data;
};

export const getSkinComments = async (skinId, includeUserDetails = false) => {
  const response = await api.get(`/api/skins/${skinId}/comments?includeUserDetails=${includeUserDetails}`);
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

// Reply APIs
export const addReply = async (skinId, commentId, replyData) => {
  const response = await api.post(`/api/skins/${skinId}/comments/${commentId}/replies`, replyData);
  return response.data;
};

export const getRepliesForComment = async (skinId, commentId, includeUserDetails = false) => {
  const response = await api.get(`/api/skins/${skinId}/comments/${commentId}/replies?includeUserDetails=${includeUserDetails}`);
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

export const fetchChampionStats = async () => {
  const response = await api.get('/api/champions/stats');
  return response.data;
};

export const fetchChampionSpecificStats = async (championName) => {
  const response = await api.get(`/api/champions/${encodeURIComponent(championName)}/stats`);
  return response.data;
}; 