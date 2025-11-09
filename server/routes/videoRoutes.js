// server/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { ensureApiAuthenticated, ensureApiAdmin } = require('../middleware/auth');

// Existing routes
router.post('/upload', ensureApiAuthenticated, videoController.uploadVideo);
router.get('/', videoController.getVideoByInteraction);

// Mux integration
router.post('/upload/init', ensureApiAuthenticated, videoController.initMuxUpload);
router.post('/webhook/mux',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // If a request hits, we’ll see it immediately
    console.log('[HIT] /api/videos/webhook/mux',
      'method=', req.method,
      'len=', req.headers['content-length'],
      'sig=', req.get('Mux-Signature')
    );
    next();
  },
  videoController.muxWebhook);
router.get('/:id/events', ensureApiAuthenticated, videoController.subscribeVideoEvents);

// Admin moderation
router.get('/admin/pending', ensureApiAuthenticated, ensureApiAdmin, videoController.listPendingVideos);
router.post('/admin/:id/approve', ensureApiAuthenticated, ensureApiAdmin, videoController.approveVideo);
router.post('/admin/:id/reject', ensureApiAuthenticated, ensureApiAdmin, videoController.rejectVideo);

module.exports = router;
