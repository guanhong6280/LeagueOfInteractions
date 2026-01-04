const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation/donationController');
const { donationLimiter } = require('../middleware/rateLimiters');

// Endpoint for creating a payment intent (with rate limiting)
router.post('/create-checkout-session', donationLimiter, donationController.createStripeSession);
router.get('/progress/:donationCardId', donationController.getDonationProgress);
router.get('/donation-cards', donationController.getDonationCards);

module.exports = router;
