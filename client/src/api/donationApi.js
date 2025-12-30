import api from './apiClient';

// ============================================
// DONATION APIs
// ============================================

/**
 * Get all donation cards
 * @returns {Promise<Array>} Array of donation card objects
 */
export const getDonationCards = async () => {
  try {
    const response = await api.get('/api/donations/donation-cards');
    return response.data;
  } catch (error) {
    console.error('Error fetching donation cards:', error);
    throw error;
  }
};

/**
 * Get donation progress for a specific donation card
 * @param {string} donationCardId - The ID of the donation card
 * @returns {Promise<Object>} Progress data containing totalDonations
 */
export const getDonationProgress = async (donationCardId) => {
  try {
    const response = await api.get(`/api/donations/progress/${donationCardId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donation progress:', error);
    throw error;
  }
};

/**
 * Create a Stripe checkout session for a donation
 * @param {Object} donationData - Donation data
 * @param {number} donationData.amount - Donation amount in cents
 * @param {string} donationData.donationCardId - The ID of the donation card
 * @returns {Promise<Object>} Checkout session data containing URL
 */
export const createDonationCheckoutSession = async (donationData) => {
  try {
    const { amount, donationCardId } = donationData;
    const response = await api.post('/api/donations/create-checkout-session', {
      amount,
      donationCardId,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export default api;

