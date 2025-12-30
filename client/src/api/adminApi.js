import api from './apiClient';

// ============================================
// ADMIN APIs
// ============================================

/**
 * Get skin synchronization status
 * @returns {Promise<Object>} Sync status data containing progress information
 */
export const getSkinSyncStatus = async () => {
  try {
    const response = await api.get('/api/skins/sync/status');
    return response.data?.data;
  } catch (error) {
    console.error('Error fetching skin sync status:', error);
    throw error;
  }
};

/**
 * Start skin database synchronization
 * @returns {Promise<Object>} Sync initiation response data
 */
export const startSkinSync = async () => {
  try {
    const response = await api.post('/api/skins/sync', {});
    return response.data;
  } catch (error) {
    console.error('Error starting skin sync:', error);
    throw error;
  }
};

export default api;

