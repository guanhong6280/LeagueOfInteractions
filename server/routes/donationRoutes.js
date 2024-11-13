const express = require('express');
const router = express.Router();
const donationController = require("../controllers/donationController");


// Endpoint for creating a payment intent
router.post('/create-checkout-session', donationController.createStripeSession);

module.exports = router;
