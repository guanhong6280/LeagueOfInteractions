const express = require('express');
const router = express.Router();
const commentModerationController = require('../controllers/commentModerationController');
const videoModerationController = require('../controllers/videoModerationController');
const { ensureApiAdmin } = require('../middleware/auth');

router.get('/comments', ensureApiAdmin, commentModerationController.getCommentModerationQueue);
router.get('/comments/summary', ensureApiAdmin, commentModerationController.getCommentModerationSummary);
router.get('/summary', ensureApiAdmin, commentModerationController.getCommentModerationSummary); // backward compat
router.post('/comments/:commentId/approve', ensureApiAdmin, commentModerationController.approveComment);
router.post('/comments/:commentId/reject', ensureApiAdmin, commentModerationController.rejectComment);

router.get('/videos', ensureApiAdmin, videoModerationController.getVideoModerationQueue);
router.get('/videos/summary', ensureApiAdmin, videoModerationController.getVideoModerationSummary);
router.post('/videos/:videoId/approve', ensureApiAdmin, videoModerationController.approveVideoModeration);
router.post('/videos/:videoId/reject', ensureApiAdmin, videoModerationController.rejectVideoModeration);

module.exports = router;

