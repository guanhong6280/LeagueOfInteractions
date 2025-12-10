const express = require('express');
const router = express.Router();
const championCommentController = require('../controllers/champion/championCommentController');
const championRatingController = require('../controllers/champion/championRatingController');
const { ensureApiAuthenticated } = require('../middleware/auth');
const moderateComment = require('../middleware/moderateComment');

router.post('/:championId/comments', ensureApiAuthenticated, moderateComment, championCommentController.commentOnChampion);
router.get('/:championId/comments', championCommentController.getCommentsForChampion);
router.get('/:championId/comments/user', ensureApiAuthenticated, championCommentController.getUserCommentForChampion);

router.post('/:championId/rate', ensureApiAuthenticated, championRatingController.rateChampion);
router.get('/:championId/ratings', championRatingController.getRatingsForChampion);
router.get('/:championId/ratings/user', ensureApiAuthenticated, championRatingController.getUserChampionRating);

router.post('/:championId/comments/:commentId/replies', ensureApiAuthenticated, moderateComment, championCommentController.addReply);
router.get('/:championId/comments/:commentId/replies', championCommentController.getRepliesForComment);

router.post('/:championId/comments/:commentId/like', ensureApiAuthenticated, championCommentController.likeComment);
router.post('/:championId/comments/:commentId/unlike', ensureApiAuthenticated, championCommentController.unlikeComment);
router.delete('/:championId/comments/:commentId', ensureApiAuthenticated, championCommentController.deleteComment);

router.post('/:championId/comments/:commentId/replies/:replyId/like', ensureApiAuthenticated, championCommentController.likeReply);
router.post('/:championId/comments/:commentId/replies/:replyId/unlike', ensureApiAuthenticated, championCommentController.unlikeReply);
router.delete('/:championId/comments/:commentId/replies/:replyId', ensureApiAuthenticated, championCommentController.deleteReply);

module.exports = router;

