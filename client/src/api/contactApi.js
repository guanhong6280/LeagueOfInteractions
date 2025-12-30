import api from './apiClient';

// ============================================
// CONTACT APIs
// ============================================

/**
 * Send a contact form message
 * @param {Object} formData - Contact form data
 * @param {string} formData.name - Sender's name
 * @param {string} formData.email - Sender's email
 * @param {string} formData.message - Message content
 * @returns {Promise<Object>} Response data
 */
export const sendContactMessage = async (formData) => {
  try {
    const response = await api.post('/api/contact', formData);
    return response.data;
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error;
  }
};

export default api;

