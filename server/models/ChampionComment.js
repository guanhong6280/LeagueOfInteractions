const mongoose = require('mongoose');

// Sub-schema for replies
const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  comment: {
    type: String,
    required: true,
    maxlength: 500,
    minlength: 1,
    trim: true,
  },
  isEdited: { type: Boolean, default: false },
  toxicityScore: { type: Number, min: 0, max: 1, default: 0 },
  spamScore: { type: Number, min: 0, max: 1, default: 0 },
  status: {
    type: String,
    enum: ['approved', 'needsReview', 'rejected'],
    default: 'approved',
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

const ChampionCommentSchema = new mongoose.Schema({
  championName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 1,
    trim: true,
  },

  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  replies: [ReplySchema],

  isEdited: { type: Boolean, default: false },
  toxicityScore: { type: Number, min: 0, max: 1, default: 0 },
  spamScore: { type: Number, min: 0, max: 1, default: 0 },
  status: {
    type: String,
    enum: ['approved', 'needsReview', 'rejected'],
    default: 'approved',
  },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  moderatedAt: { type: Date, default: null },
  moderatorNotes: { type: String, default: '' },
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

ChampionCommentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL' },
});

ChampionCommentSchema.virtual('replyCount').get(function replyCountGetter() {
  return this.replies ? this.replies.length : 0;
});

ReplySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL' },
});

ChampionCommentSchema.set('toJSON', { virtuals: true });
ChampionCommentSchema.set('toObject', { virtuals: true });
ReplySchema.set('toJSON', { virtuals: true });
ReplySchema.set('toObject', { virtuals: true });

ChampionCommentSchema.index({ championName: 1, createdAt: -1 });
ChampionCommentSchema.index({ userId: 1 });
ChampionCommentSchema.index({ likedBy: 1 });
ChampionCommentSchema.index({ championName: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ChampionComment', ChampionCommentSchema);

