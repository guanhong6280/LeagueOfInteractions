const mongoose = require('mongoose');
const PatchDiscussionComment = require('../../models/PatchDiscussionComment');
const PatchDiscussionPost = require('../../models/PatchDiscussionPost');
const CommentService = require('../../services/CommentService');
const { sendError } = require('../../utils/response');

/**
 * Middleware wrapper to validate and resolve postId
 */
const withPostValidation = (serviceFn) => async (req, res) => {
  try {
    const { postId } = req.params;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid Post ID format', { status: 400 });
    }

    // Check if post exists
    const post = await PatchDiscussionPost.findById(postId).select('_id').lean();

    if (!post) {
      return sendError(res, 'Post not found', { status: 404 });
    }

    // Set postId in params for the service
    req.params.postId = postId;
    return serviceFn(req, res);

  } catch (error) {
    console.error('Error validating post:', error);
    return sendError(res, 'Server error validating post', { status: 500 });
  }
};

/**
 * Function to update post's comment count
 */
const updatePostCommentCount = async (postId) => {
  try {
    const commentCount = await PatchDiscussionComment.countDocuments({
      postId,
      status: 'approved',
    });

    await PatchDiscussionPost.findByIdAndUpdate(postId, {
      commentCount,
    });
  } catch (error) {
    console.error('Error updating post comment count:', error);
  }
};

// Create the comment service instance
const commentService = new CommentService({
  CommentModel: PatchDiscussionComment,
  entityIdField: 'postId',
  validateEntityFn: async (postId) => {
    const post = await PatchDiscussionPost.exists({ _id: postId });
    return !!post;
  },
  updateStatsFn: updatePostCommentCount,
  idType: 'ObjectId', // MongoDB ObjectId type
});

// Export wrapped controller methods
exports.commentOnPost = withPostValidation((req, res) => commentService.commentOnEntity(req, res));
exports.getCommentsForPost = withPostValidation((req, res) => commentService.getComments(req, res));
exports.getUserCommentForPost = withPostValidation((req, res) => commentService.getUserComment(req, res));
exports.likeComment = withPostValidation((req, res) => commentService.likeComment(req, res));
exports.unlikeComment = withPostValidation((req, res) => commentService.unlikeComment(req, res));
exports.deleteComment = withPostValidation((req, res) => commentService.deleteComment(req, res));
exports.likeReply = withPostValidation((req, res) => commentService.likeReply(req, res));
exports.unlikeReply = withPostValidation((req, res) => commentService.unlikeReply(req, res));
exports.addReply = withPostValidation((req, res) => commentService.addReply(req, res));
exports.deleteReply = withPostValidation((req, res) => commentService.deleteReply(req, res));
exports.getRepliesForComment = withPostValidation((req, res) => commentService.getReplies(req, res));
