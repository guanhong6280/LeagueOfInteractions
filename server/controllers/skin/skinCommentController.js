const SkinComment = require('../../models/SkinComment');
const Skin = require('../../models/Skin');
const CommentService = require('../../services/CommentService');
// const { enqueueSummaryCheck } = require('../../config/summaryQueue'); // Preserved if needed later

/**
 * Helper function to update skin's aggregated comment statistics.
 * @param {Number} skinId - The skin ID
 */
async function updateSkinCommentStats(skinId) {
  try {
    const comments = await SkinComment.find({ skinId });
    await Skin.updateOne(
      { skinId },
      {
        $set: {
          totalNumberOfComments: comments.length,
        },
      }
    );
  } catch (err) {
    console.error('Error updating skin comment stats:', err);
  }
}

const commentService = new CommentService({
  CommentModel: SkinComment,
  EntityModel: Skin,
  entityIdField: 'skinId',
  updateStatsFn: updateSkinCommentStats,
  idType: 'Number'
});

exports.commentOnSkin = (req, res) => commentService.commentOnEntity(req, res);
exports.getCommentsForSkin = (req, res) => commentService.getComments(req, res);
exports.getUserCommentForSkin = (req, res) => commentService.getUserComment(req, res);
exports.likeComment = (req, res) => commentService.likeComment(req, res);
exports.unlikeComment = (req, res) => commentService.unlikeComment(req, res);
exports.deleteComment = (req, res) => commentService.deleteComment(req, res);
exports.likeReply = (req, res) => commentService.likeReply(req, res);
exports.unlikeReply = (req, res) => commentService.unlikeReply(req, res);
exports.addReply = (req, res) => commentService.addReply(req, res);
exports.deleteReply = (req, res) => commentService.deleteReply(req, res);
exports.getRepliesForComment = (req, res) => commentService.getReplies(req, res);
