const Video = require('../../models/Video');
const { deleteAsset } = require('../../utils/mux');
const {
  parseLimit,
  parseCsvParam,
  parseVideoModerationStatuses,
  buildVideoModerationClause,
  toObjectIdCursor,
} = require('../../utils/moderationHelpers');

const formatContributor = (contributor) => {
  if (!contributor) return null;
  if (typeof contributor === 'string') {
    return { id: contributor, username: null, email: null };
  }
  const id = contributor._id ? contributor._id.toString() : undefined;
  return {
    id: id || contributor.toString(),
    username: contributor.username || null,
    email: contributor.email || null,
  };
};

const formatVideoModerationRecord = (video) => ({
  videoId: video._id,
  provider: video.provider,
  status: video.status,
  isApproved: typeof video.isApproved === 'boolean' ? video.isApproved : false,
  moderationStatus: video.moderationStatus || 'pending',
  playbackUrl: video.playbackUrl,
  playbackId: video.playbackId,
  assetId: video.assetId,
  directUploadId: video.directUploadId,
  videoURL: video.videoURL,
  duration: video.duration,
  aspectRatio: video.aspectRatio,
  maxResolution: video.maxResolution,
  champion1: video.champion1,
  ability1: video.ability1,
  champion2: video.champion2,
  ability2: video.ability2,
  interactionKey: video.interactionKey,
  title: video.title,
  description: video.description,
  createdAt: video.createdAt,
  updatedAt: video.updatedAt,
  moderatedAt: video.moderatedAt,
  moderatedBy: video.moderatedBy,
  moderatorNotes: video.moderatorNotes,
  contributor: formatContributor(video.contributor),
});

exports.getVideoModerationQueue = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const moderationStatuses = parseVideoModerationStatuses(req.query.moderationStatus);
    const processingStatuses = parseCsvParam(req.query.processingStatus);
    const providers = parseCsvParam(req.query.provider);
    const cursor = toObjectIdCursor(req.query.cursor);

    const filter = {};
    const statusClause = buildVideoModerationClause(moderationStatuses);
    if (statusClause.$or) {
      filter.$or = statusClause.$or;
    } else {
      Object.assign(filter, statusClause);
    }

    if (processingStatuses.length) {
      filter.status = { $in: processingStatuses };
    }

    if (providers.length) {
      filter.provider = { $in: providers };
    }

    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const videos = await Video.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate('contributor', 'username email')
      .lean();

    const hasNext = videos.length > limit;
    const items = hasNext ? videos.slice(0, limit) : videos;
    const nextCursor = hasNext ? videos[limit]._id.toString() : null;

    const data = items.map(formatVideoModerationRecord);

    res.json({
      success: true,
      data,
      pagination: {
        nextCursor,
        limit,
      },
    });
  } catch (err) {
    console.error('Error fetching video moderation queue:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video moderation queue.',
      message: err.message,
    });
  }
};

const updateVideoModerationStatus = async (req, res, nextStatus) => {
  try {
    const { videoId } = req.params;
    const { note = '', deleteRemote = false } = req.body || {};

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found.',
      });
    }

    video.isApproved = nextStatus === 'approved';
    video.moderationStatus = nextStatus;
    video.moderatedBy = req.user?._id || null;
    video.moderatedAt = new Date();
    video.moderatorNotes = note;

    if (
      nextStatus === 'rejected' &&
      deleteRemote &&
      video.provider === 'mux' &&
      video.assetId
    ) {
      try {
        await deleteAsset(video.assetId);
      } catch (error) {
        console.error('Failed to delete Mux asset:', error.message);
      }
      video.status = 'failed';
      video.playbackUrl = null;
      video.playbackId = null;
      video.assetId = null;
    }

    await video.save();
    await video.populate('contributor', 'username email');

    const plainVideo = video.toObject({ depopulate: false });

    res.json({
      success: true,
      data: formatVideoModerationRecord(plainVideo),
    });
  } catch (err) {
    console.error(`Error updating video status to ${nextStatus}:`, err);
    res.status(500).json({
      success: false,
      error: `Failed to ${nextStatus} video.`,
      message: err.message,
    });
  }
};

exports.approveVideoModeration = (req, res) => updateVideoModerationStatus(req, res, 'approved');

exports.rejectVideoModeration = (req, res) => updateVideoModerationStatus(req, res, 'rejected');

exports.getVideoModerationSummary = async (req, res) => {
  try {
    const aggregation = await Video.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$moderationStatus', 'pending'] },
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
        pending: summary.pending || 0,
        approved: summary.approved || 0,
        rejected: summary.rejected || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching video moderation summary:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video moderation summary.',
      message: err.message,
    });
  }
};

