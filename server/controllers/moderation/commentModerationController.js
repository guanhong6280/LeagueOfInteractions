const Skin = require('../../models/Skin');
const SkinComment = require('../../models/SkinComment');
const ChampionComment = require('../../models/ChampionComment');
const {
  TOX_LOW,
  TOX_MID,
  TOX_HIGH,
  SPAM_LOW,
  SPAM_MID,
  SPAM_HIGH,
} = require('../../config/moderation');
const {
  parseLimit,
  parseStatuses,
  toObjectIdCursor,
} = require('../../utils/moderationHelpers');

const parseCommentType = (value) => {
  if (!value) return 'skin';
  const lowered = value.toString().trim().toLowerCase();
  return lowered === 'champion' ? 'champion' : 'skin';
};

const buildSkinContext = async (comments) => {
  const skinIds = [...new Set(comments.map((comment) => comment.skinId))];
  if (!skinIds.length) {
    return new Map();
  }

  const skins = await Skin.find({ skinId: { $in: skinIds } })
    .select('skinId name championId rarity splashPath loadScreenPath')
    .lean();
  return new Map(skins.map((skin) => [skin.skinId, skin]));
};

const buildChampionContext = async (comments) => {
  const championIds = [...new Set(comments.map((comment) => comment.championId))];
  if (!championIds.length) {
    return new Map();
  }

  const championSkins = await Skin.find({ championId: { $in: championIds } })
    .select('championId skinId name splashPath loadScreenPath rarity')
    .lean();

  const championMap = new Map();
  championSkins.forEach((skin) => {
    if (!championMap.has(skin.championId)) {
      championMap.set(skin.championId, {
        championId: skin.championId,
        representativeSkin: {
          skinId: skin.skinId,
          name: skin.name,
          splashPath: skin.splashPath || null,
          loadScreenPath: skin.loadScreenPath || null,
          rarity: skin.rarity || null,
        },
      });
    }
  });

  return championMap;
};

exports.getCommentModerationQueue = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const statuses = parseStatuses(req.query.status);
    const cursor = toObjectIdCursor(req.query.cursor);
    const commentType = parseCommentType(req.query.type);

    const filter = { status: { $in: statuses } };
    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const CommentModel = commentType === 'champion' ? ChampionComment : SkinComment;

    const comments = await CommentModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate('user', 'username profilePictureURL')
      .lean({ virtuals: true });

    const hasNext = comments.length > limit;
    const items = hasNext ? comments.slice(0, limit) : comments;
    const nextCursor = hasNext ? comments[limit]._id.toString() : null;

    let subjectMap = new Map();
    if (commentType === 'champion') {
      subjectMap = await buildChampionContext(items);
    } else {
      subjectMap = await buildSkinContext(items);
    }

    const data = items.map((comment) => {
      const base = {
        commentId: comment._id,
        userId: comment.userId,
        username: comment.username,
        profilePictureURL: comment.user?.profilePictureURL || null,
        comment: comment.comment,
        status: comment.status,

        toxicityScore: comment.toxicityScore,
        spamScore: comment.spamScore,
        autoModerationFailed: comment.autoModerationFailed || false,

        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        moderatedBy: comment.moderatedBy,
        moderatedAt: comment.moderatedAt,
        moderatorNotes: comment.moderatorNotes,
        subjectType: commentType,
      };

      if (commentType === 'champion') {
        return {
          ...base,
          championId: comment.championId,
          champion: subjectMap.get(comment.championId) || { championId: comment.championId },
        };
      }

      return {
        ...base,
        skinId: comment.skinId,
        skin: subjectMap.get(comment.skinId) || null,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        nextCursor,
        limit,
      },
      thresholds: {
        toxicity: {
          low: TOX_LOW,
          mid: TOX_MID,
          high: TOX_HIGH,
        },
        spam: {
          low: SPAM_LOW,
          mid: SPAM_MID,
          high: SPAM_HIGH,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching comment moderation queue:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation queue.',
      message: err.message,
    });
  }
};

const resolveCommentById = async (commentId, typeHint) => {
  const normalizedType = parseCommentType(typeHint);

  if (normalizedType === 'champion') {
    const comment = await ChampionComment.findById(commentId);
    if (comment) {
      return { type: 'champion', comment };
    }
    return { type: 'champion', comment: null };
  }

  const skinComment = await SkinComment.findById(commentId);
  if (skinComment) {
    return { type: 'skin', comment: skinComment };
  }

  const championComment = await ChampionComment.findById(commentId);
  if (championComment) {
    return { type: 'champion', comment: championComment };
  }

  return { type: normalizedType, comment: null };
};

const updateCommentStatus = async (req, res, nextStatus) => {
  try {
    const { commentId } = req.params;
    const { note = '' } = req.body || {};
    const { type: typeQuery } = req.query;

    const { type: subjectType, comment } = await resolveCommentById(commentId, typeQuery);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found.',
      });
    }

    comment.status = nextStatus;
    comment.moderatedBy = req.user?._id || null;
    comment.moderatedAt = new Date();
    comment.moderatorNotes = note;

    await comment.save();

    let subject = null;
    if (subjectType === 'champion') {
      const championContext = await buildChampionContext([comment]);
      subject = championContext.get(comment.championId) || { championId: comment.championId };
    } else {
      subject = await Skin.findOne({ skinId: comment.skinId })
        .select('skinId name championId rarity splashPath loadScreenPath')
        .lean();
    }

    res.json({
      success: true,
      data: {
        commentId: comment._id,
        skinId: subjectType === 'skin' ? comment.skinId : undefined,
        championId: subjectType === 'champion' ? comment.championId : undefined,
        status: comment.status,
        moderatorNotes: comment.moderatorNotes,
        moderatedBy: comment.moderatedBy,
        moderatedAt: comment.moderatedAt,
        subjectType,
        subject,
      },
    });
  } catch (err) {
    console.error(`Error updating comment status to ${nextStatus}:`, err);
    res.status(500).json({
      success: false,
      error: `Failed to ${nextStatus} comment.`,
      message: err.message,
    });
  }
};

exports.approveComment = (req, res) => updateCommentStatus(req, res, 'approved');

exports.rejectComment = (req, res) => updateCommentStatus(req, res, 'rejected');

exports.getCommentModerationSummary = async (req, res) => {
  try {
    const commentType = parseCommentType(req.query.type);
    const CommentModel = commentType === 'champion' ? ChampionComment : SkinComment;

    const aggregation = await CommentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = aggregation.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: Object.values(summary).reduce((sum, value) => sum + value, 0),
        approved: summary.approved || 0,
        needsReview: summary.needsReview || 0,
        rejected: summary.rejected || 0,
        subjectType: commentType,
      },
    });
  } catch (err) {
    console.error('Error fetching moderation summary:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation summary.',
      message: err.message,
    });
  }
};

