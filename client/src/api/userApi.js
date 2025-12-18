import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5174',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
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

// ============================================
// USER PROFILE APIs
// ============================================

/**
 * Get user profile by username
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfileByUsername = async (username) => {
  try {
    const response = await api.get(`/api/users/profile/${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user activity (ratings and comments)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.type - Activity type: 'all', 'championRatings', 'skinRatings', 'championComments', 'skinComments'
 * @param {number} options.limit - Number of results (default: 20, max: 100)
 * @returns {Promise<Object>} Activity data
 */
export const getUserActivity = async (userId, options = {}) => {
  try {
    const { type = 'all', limit = 20 } = options;
    const response = await api.get(`/api/users/${userId}/activity`, {
      params: { type, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

/**
 * Update authenticated user information
 * @param {Object} updatedData - Payload containing user fields to update
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserInformation = async (updatedData) => {
  try {
    const response = await api.put('/api/users/updateUserInformation', updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating user information:', error);
    throw error;
  }
};

// ============================================
// SKIN BATCH APIs
// ============================================

/**
 * Get multiple skins by their IDs (batch fetch)
 * @param {Array<number>} skinIds - Array of skin IDs
 * @returns {Promise<Object>} Batch skin data
 */
export const getSkinsByIds = async (skinIds) => {
  try {
    if (!skinIds || skinIds.length === 0) {
      return { success: true, count: 0, data: [] };
    }
    
    const idsParam = skinIds.join(',');
    const response = await api.get(`/api/skins/batch?ids=${idsParam}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching skins by IDs:', error);
    throw error;
  }
};

export default api;

