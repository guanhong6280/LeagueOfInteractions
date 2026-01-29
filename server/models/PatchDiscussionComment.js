const mongoose = require('mongoose');

// Reply sub-schema (nested comments)
const PatchReplySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 1,
    trim: true,
  },

  // Engagement
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Moderation
  isEdited: { type: Boolean, default: false },
  toxicityScore: { type: Number, min: 0, max: 1, default: 0 },
  spamScore: { type: Number, min: 0, max: 1, default: 0 },
  autoModerationFailed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['approved', 'needsReview', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

const PatchDiscussionCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatchDiscussionPost',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  comment: {
    type: String,
    required: true,
    maxlength: 2000,
    minlength: 1,
    trim: true,
  },

  // Engagement
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Nested replies
  replies: [PatchReplySchema],

  // Moderation
  isEdited: { type: Boolean, default: false },
  toxicityScore: { type: Number, min: 0, max: 1, default: 0 },
  spamScore: { type: Number, min: 0, max: 1, default: 0 },
  autoModerationFailed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['approved', 'needsReview', 'rejected'],
    default: 'approved',
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  moderatedAt: { type: Date, default: null },
  moderatorNotes: { type: String, default: '' },
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

// Virtuals
PatchDiscussionCommentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL rank' },
});

PatchDiscussionCommentSchema.virtual('likeCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

PatchDiscussionCommentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

PatchReplySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL' },
});

PatchReplySchema.virtual('likeCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

// Indexes
PatchDiscussionCommentSchema.index({ postId: 1, createdAt: 1 }); // Chronological comments
PatchDiscussionCommentSchema.index({ userId: 1 }); // User's comments
PatchDiscussionCommentSchema.index({ likedBy: 1 }); // For checking if user liked

PatchDiscussionCommentSchema.set('toJSON', { virtuals: true });
PatchDiscussionCommentSchema.set('toObject', { virtuals: true });
PatchReplySchema.set('toJSON', { virtuals: true });
PatchReplySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PatchDiscussionComment', PatchDiscussionCommentSchema);
