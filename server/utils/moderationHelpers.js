const mongoose = require('mongoose');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parseLimit = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(numeric, MAX_LIMIT);
};

const parseStatuses = (value) => {
  if (!value) return ['needsReview'];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseCsvParam = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toLowerCase());
};

const parseVideoModerationStatuses = (value) => {
  const parsed = parseCsvParam(value);
  return parsed.length ? parsed : ['pending'];
};

const buildVideoModerationClause = (statuses) => {
  const unique = [...new Set(statuses)];
  const includePending = unique.includes('pending');
  const otherStatuses = unique.filter((status) => status !== 'pending');

  if (includePending && otherStatuses.length) {
    return {
      $or: [
        { moderationStatus: { $in: otherStatuses } },
        { moderationStatus: 'pending' },
        { moderationStatus: { $exists: false } },
      ],
    };
  }

  if (includePending) {
    return {
      $or: [
        { moderationStatus: 'pending' },
        { moderationStatus: { $exists: false } },
      ],
    };
  }

  if (!otherStatuses.length) {
    return { moderationStatus: 'pending' };
  }

  return { moderationStatus: { $in: otherStatuses } };
};

const toObjectIdCursor = (cursor) => {
  if (typeof cursor !== 'string' || !mongoose.isValidObjectId(cursor)) {
    return null;
  }
  return mongoose.Types.ObjectId.createFromHexString(cursor);
};

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parseLimit,
  parseStatuses,
  parseCsvParam,
  parseVideoModerationStatuses,
  buildVideoModerationClause,
  toObjectIdCursor,
};

