// server/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Routes for video operations
router.post('/upload', videoController.uploadVideo);
router.get('/', videoController.getVideoByInteraction);
// Add more routes as needed

module.exports = router;
