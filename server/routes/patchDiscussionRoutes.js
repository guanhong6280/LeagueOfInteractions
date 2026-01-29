const express = require('express');
const router = express.Router();
const patchDiscussionPostController = require('../controllers/patchDiscussion/patchDiscussionPostController');
const patchDiscussionCommentController = require('../controllers/patchDiscussion/patchDiscussionCommentController');
const { ensureApiAuthenticated, optionalAuth } = require('../middleware/auth');
const moderateComment = require('../middleware/moderateComment');
const moderatePost = require('../middleware/moderatePost');

// ========================================
// POST ROUTES
// ========================================

// Get all posts (with filtering and sorting)
router.get('/posts', optionalAuth, patchDiscussionPostController.getPosts);

// Get a single post by ID
router.get('/posts/:postId', optionalAuth, patchDiscussionPostController.getPostById);

// Create a new post
router.post('/posts', ensureApiAuthenticated, moderatePost, patchDiscussionPostController.createPost);

// Update a post (only by author)
router.put('/posts/:postId', ensureApiAuthenticated, moderatePost, patchDiscussionPostController.updatePost);

// Delete a post (only by author or admin)
router.delete('/posts/:postId', ensureApiAuthenticated, patchDiscussionPostController.deletePost);

// Like/Unlike post
router.post('/posts/:postId/like', ensureApiAuthenticated, patchDiscussionPostController.likePost);
router.post('/posts/:postId/unlike', ensureApiAuthenticated, patchDiscussionPostController.unlikePost);

// Increment view count
router.post('/posts/:postId/view', patchDiscussionPostController.incrementView);

// Get user's own posts
router.get('/posts/user/me', ensureApiAuthenticated, patchDiscussionPostController.getUserPosts);

// ========================================
// COMMENT ROUTES
// ========================================

// Get comments for a post
router.get('/posts/:postId/comments', patchDiscussionCommentController.getCommentsForPost);

// Get user's comment for a post
router.get('/posts/:postId/comments/user', ensureApiAuthenticated, patchDiscussionCommentController.getUserCommentForPost);

// Comment on a post
router.post('/posts/:postId/comments', ensureApiAuthenticated, moderateComment, patchDiscussionCommentController.commentOnPost);

// Like/Unlike comment
router.post('/posts/:postId/comments/:commentId/like', ensureApiAuthenticated, patchDiscussionCommentController.likeComment);
router.post('/posts/:postId/comments/:commentId/unlike', ensureApiAuthenticated, patchDiscussionCommentController.unlikeComment);

// Delete comment
router.delete('/posts/:postId/comments/:commentId', ensureApiAuthenticated, patchDiscussionCommentController.deleteComment);

// ========================================
// REPLY ROUTES
// ========================================

// Get replies for a comment
router.get('/posts/:postId/comments/:commentId/replies', patchDiscussionCommentController.getRepliesForComment);

// Add reply to comment
router.post('/posts/:postId/comments/:commentId/replies', ensureApiAuthenticated, moderateComment, patchDiscussionCommentController.addReply);

// Like/Unlike reply
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', ensureApiAuthenticated, patchDiscussionCommentController.likeReply);
router.post('/posts/:postId/comments/:commentId/replies/:replyId/unlike', ensureApiAuthenticated, patchDiscussionCommentController.unlikeReply);

// Delete reply
router.delete('/posts/:postId/comments/:commentId/replies/:replyId', ensureApiAuthenticated, patchDiscussionCommentController.deleteReply);

module.exports = router;
