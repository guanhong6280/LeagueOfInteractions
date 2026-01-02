const mongoose = require('mongoose');
const ChampionComment = require('../../models/ChampionComment');
const ChampionStats = require('../../models/ChampionStats');
const CommentService = require('../../services/CommentService');
const { sendError } = require('../../utils/response');

// --- THE CACHE LAYER ---
// Since we only have ~168 champions, this takes up negligible RAM (kilobytes).
const idToNameCache = new Map();

/**
 * Resolver Middleware with Caching
 * 1. Checks memory first (0ms latency).
 * 2. Fallback to DB if missing (only happens once per server restart).
 */
const withChampionName = (serviceFn) => async (req, res) => {
  try {
    const { championId } = req.params;

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(championId)) {
      return sendError(res, 'Invalid Champion ID format', { status: 400 });
    }

    // 2. CACHE HIT: Check if we already know this ID
    if (idToNameCache.has(championId)) {
      req.params.championName = idToNameCache.get(championId);
      return serviceFn(req, res); // ⚡️ INSTANT RETURN
    }

    // 3. CACHE MISS: Look it up in the DB
    const champ = await ChampionStats.findById(championId).select('championName').lean();
    
    if (!champ) {
      return sendError(res, 'Champion not found', { status: 404 });
    }

    // 4. WRITE TO CACHE
    idToNameCache.set(championId, champ.championName);

    // 5. Execute Service
    req.params.championName = champ.championName;
    return serviceFn(req, res);

  } catch (error) {
    console.error('Error resolving champion name:', error);
    return sendError(res, 'Server error resolving champion', { status: 500 });
  }
};

// ... Rest of your Service Setup is exactly the same ...
const commentService = new CommentService({
  CommentModel: ChampionComment,
  entityIdField: 'championName', 
  validateEntityFn: async () => true, 
  idType: 'String'
});

// Exports
exports.commentOnChampion = withChampionName((req, res) => commentService.commentOnEntity(req, res));
exports.getCommentsForChampion = withChampionName((req, res) => commentService.getComments(req, res));
exports.getUserCommentForChampion = withChampionName((req, res) => commentService.getUserComment(req, res));
// ... wrap the others too ...
exports.likeComment = withChampionName((req, res) => commentService.likeComment(req, res));
exports.unlikeComment = withChampionName((req, res) => commentService.unlikeComment(req, res));
exports.deleteComment = withChampionName((req, res) => commentService.deleteComment(req, res));
exports.likeReply = withChampionName((req, res) => commentService.likeReply(req, res));
exports.unlikeReply = withChampionName((req, res) => commentService.unlikeReply(req, res));
exports.addReply = withChampionName((req, res) => commentService.addReply(req, res));
exports.deleteReply = withChampionName((req, res) => commentService.deleteReply(req, res));
exports.getRepliesForComment = withChampionName((req, res) => commentService.getReplies(req, res));
