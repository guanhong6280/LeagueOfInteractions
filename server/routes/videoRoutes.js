const express = require('express');
const router = express.Router();
const { uploadLimiter } = require('../middleware/rateLimiters');
const videoController = require('../controllers/video/videoController');
const { ensureApiAuthenticated, ensureApiAdmin, optionalAuth } = require('../middleware/auth');

// Existing routes
router.post('/upload', uploadLimiter, ensureApiAuthenticated, videoController.uploadVideo);
router.get('/', optionalAuth, videoController.getVideoByInteraction);
router.get('/:id', optionalAuth, videoController.getVideoById);

// Mux integration
router.post('/upload/init', uploadLimiter, ensureApiAuthenticated, videoController.initMuxUpload);
router.post('/:id/view', videoController.incrementView);
router.post('/:id/like', ensureApiAuthenticated, videoController.toggleLike);
// router.get('/:id/events', ensureApiAuthenticated, videoController.subscribeVideoEvents);

module.exports = router;
