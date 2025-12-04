const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation/donationController');


// Endpoint for creating a payment intent
router.post('/create-checkout-session', donationController.createStripeSession);
router.get('/progress/:donationCardId', donationController.getDonationProgress);
router.get('/donation-cards', donationController.getDonationCards);

module.exports = router;
