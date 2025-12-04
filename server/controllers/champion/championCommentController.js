const ChampionComment = require('../../models/ChampionComment');
const Skin = require('../../models/Skin');
const CommentService = require('../../services/CommentService');

// Custom validation function (Original Logic)
async function ensureChampionExists(championId) {
  if (!championId || typeof championId !== 'string') {
    return false;
  }
  const normalizedId = championId.trim();
  if (!normalizedId) {
    return false;
  }
  // We check if ANY skin exists for this champion to verify the champion exists
  const championSkin = await Skin.exists({ championId: normalizedId });
  return !!championSkin;
}

const commentService = new CommentService({
  CommentModel: ChampionComment,
  entityIdField: 'championId',
  userHistoryField: 'recentChampionComments',
  validateEntityFn: ensureChampionExists
});

exports.commentOnChampion = (req, res) => commentService.commentOnEntity(req, res);
exports.getCommentsForChampion = (req, res) => commentService.getComments(req, res);
exports.getUserCommentForChampion = (req, res) => commentService.getUserComment(req, res);
exports.likeComment = (req, res) => commentService.likeComment(req, res);
exports.unlikeComment = (req, res) => commentService.unlikeComment(req, res);
exports.likeReply = (req, res) => commentService.likeReply(req, res);
exports.unlikeReply = (req, res) => commentService.unlikeReply(req, res);
exports.addReply = (req, res) => commentService.addReply(req, res);
exports.getRepliesForComment = (req, res) => commentService.getReplies(req, res);
