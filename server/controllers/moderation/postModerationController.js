const PatchDiscussionPost = require('../../models/PatchDiscussionPost');
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

/**
 * Get moderation queue for patch discussion posts
 */
exports.getPostModerationQueue = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const statuses = parseStatuses(req.query.status);
    const cursor = toObjectIdCursor(req.query.cursor);

    const filter = { status: { $in: statuses } };
    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const posts = await PatchDiscussionPost.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate('user', 'username profilePictureURL')
      .lean({ virtuals: true });

    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;
    const nextCursor = hasNext ? posts[limit]._id.toString() : null;

    const data = items.map((post) => ({
      postId: post._id,
      userId: post.userId,
      username: post.user?.username || null,
      profilePictureURL: post.user?.profilePictureURL || null,
      title: post.title,
      body: post.body,
      patchVersion: post.patchVersion,
      selectedChampion: post.selectedChampion || null,
      selectedGameMode: post.selectedGameMode || null,
      status: post.status,
      toxicityScore: post.toxicityScore,
      spamScore: post.spamScore,
      autoModerationFailed: post.autoModerationFailed || false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      moderatedBy: post.moderatedBy,
      moderatedAt: post.moderatedAt,
      moderatorNotes: post.moderatorNotes,
      // Engagement metrics
      likeCount: post.likedBy?.length || 0,
      viewCount: post.viewCount || 0,
      commentCount: post.commentCount || 0,
    }));

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
    console.error('Error fetching post moderation queue:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation queue.',
      message: err.message,
    });
  }
};

/**
 * Update post status (approve or reject)
 */
const updatePostStatus = async (req, res, nextStatus) => {
  try {
    const { postId } = req.params;
    const { note = '' } = req.body || {};

    const post = await PatchDiscussionPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found.',
      });
    }

    post.status = nextStatus;
    post.moderatedBy = req.user?._id || null;
    post.moderatedAt = new Date();
    post.moderatorNotes = note;

    await post.save();

    // Populate user for response
    await post.populate('user', 'username profilePictureURL');

    res.json({
      success: true,
      data: {
        postId: post._id,
        title: post.title,
        body: post.body,
        patchVersion: post.patchVersion,
        selectedChampion: post.selectedChampion,
        selectedGameMode: post.selectedGameMode,
        status: post.status,
        moderatorNotes: post.moderatorNotes,
        moderatedBy: post.moderatedBy,
        moderatedAt: post.moderatedAt,
        user: {
          username: post.user?.username || null,
          profilePictureURL: post.user?.profilePictureURL || null,
        },
      },
    });
  } catch (err) {
    console.error(`Error updating post status to ${nextStatus}:`, err);
    res.status(500).json({
      success: false,
      error: `Failed to ${nextStatus} post.`,
      message: err.message,
    });
  }
};

exports.approvePost = (req, res) => updatePostStatus(req, res, 'approved');

exports.rejectPost = (req, res) => updatePostStatus(req, res, 'rejected');

/**
 * Get moderation summary for patch discussion posts
 */
exports.getPostModerationSummary = async (req, res) => {
  try {
    const aggregation = await PatchDiscussionPost.aggregate([
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
      },
    });
  } catch (err) {
    console.error('Error fetching post moderation summary:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation summary.',
      message: err.message,
    });
  }
};
