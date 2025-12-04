const express = require('express');
const router = express.Router();
const skinController = require('../controllers/skin/skinController');
const skinRatingController = require('../controllers/skin/skinRatingController');
const skinCommentController = require('../controllers/skin/skinCommentController');
const { ensureApiAuthenticated, optionalAuth, ensureApiAdmin } = require('../middleware/auth');
const moderateComment = require('../middleware/moderateComment');

// GET /api/skins - Get all skins (with optional filters)
// Example: GET /api/skins?championId=Annie&skinLineId=110
router.get('/', skinController.getAllSkins);

// POST /api/skins/sync - Manual trigger for skin synchronization
router.post('/sync', ensureApiAuthenticated, ensureApiAdmin, skinController.syncSkins);

// GET /api/skins/:skinId - Get a specific skin by ID
// Example: GET /api/skins/1000
router.get('/:skinId', skinController.getSkinById);

// POST /api/skins/:skinId/rate - Submit or update a rating for a skin
// Body: { splashArtRating: 5, inGameModelRating: 4 }
router.post('/:skinId/rate', ensureApiAuthenticated, skinRatingController.rateSkin);

// GET /api/skins/:skinId/ratings - Get all ratings for a skin
// Query params: includeUserDetails=true (optional)
router.get('/:skinId/ratings', skinRatingController.getRatingsForSkin);

// GET /api/skins/:skinId/ratings/user - Get current user's rating for a skin
router.get('/:skinId/ratings/user', ensureApiAuthenticated, skinRatingController.getUserRatingForSkin);

// POST /api/skins/:skinId/comment - Submit or update a comment for a skin
// Body: { comment: "This skin looks amazing!" }
router.post('/:skinId/comment', ensureApiAuthenticated, moderateComment, skinCommentController.commentOnSkin);

// GET /api/skins/:skinId/comments - Get all comments for a skin
// Query params: includeUserDetails=true (optional)
router.get('/:skinId/comments', skinCommentController.getCommentsForSkin);

// GET /api/skins/:skinId/comments/user - Get current user's comment for a skin
router.get('/:skinId/comments/user', ensureApiAuthenticated, skinCommentController.getUserCommentForSkin);

// Reply functionality
router.post('/:skinId/comments/:commentId/replies', ensureApiAuthenticated, moderateComment, skinCommentController.addReply);
router.get('/:skinId/comments/:commentId/replies', skinCommentController.getRepliesForComment);

// Like/unlike parent comment
router.post('/:skinId/comments/:commentId/like', ensureApiAuthenticated, skinCommentController.likeComment);
router.post('/:skinId/comments/:commentId/unlike', ensureApiAuthenticated, skinCommentController.unlikeComment);

// Like/unlike reply
router.post('/:skinId/comments/:commentId/replies/:replyId/like', ensureApiAuthenticated, skinCommentController.likeReply);
router.post('/:skinId/comments/:commentId/replies/:replyId/unlike', ensureApiAuthenticated, skinCommentController.unlikeReply);

// GET /api/skins/:skinId/summary - Get AI-generated summary for a skin (Week 1 addition)
router.get('/:skinId/summary', skinController.getSkinSummary);

module.exports = router;
