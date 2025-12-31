const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video/videoController');
const donationController = require('../controllers/donation/donationController');


// Define the routes
// Note: These routes are mounted at /api/webhook in server.js
// So the full paths will be: /api/webhook/stripe and /api/webhook/mux
router.post('/stripe', express.raw({ type: 'application/json' }), donationController.handleStripeWebhook);
router.post('/mux', express.raw({ type: 'application/json' }), videoController.muxWebhook);

module.exports = router;