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
  spamScore:     { type: Number, min: 0, max: 1, default: 0 },
  autoModerationFailed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['approved', 'needsReview', 'rejected'],
    default: 'approved',
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who liked the reply
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

const SkinCommentSchema = new mongoose.Schema({
  skinId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Comment content
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 1,
    trim: true,
  },

  // Engagement metrics
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who liked

  // Replies system
  replies: [ReplySchema],

  isEdited: { type: Boolean, default: false },
  toxicityScore: { type: Number, min: 0, max: 1, default: 0 },
  spamScore:     { type: Number, min: 0, max: 1, default: 0 },
  autoModerationFailed: { type: Boolean, default: false },
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

// Virtual field for comment user
SkinCommentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL' }
});

// Virtual field for reply count
SkinCommentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual field for reply users (in subdocuments)
ReplySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL' }
});

// Ensure virtuals are included when converting to JSON
SkinCommentSchema.set('toJSON', { virtuals: true });
SkinCommentSchema.set('toObject', { virtuals: true });
ReplySchema.set('toJSON', { virtuals: true });
ReplySchema.set('toObject', { virtuals: true });

// Create indexes for faster querying
SkinCommentSchema.index({ skinId: 1, dateCreated: -1 }); // Get comments by skin, newest first
SkinCommentSchema.index({ userId: 1 });
SkinCommentSchema.index({ 'likedBy': 1 });

// Unique constraint: One comment per user per skin
SkinCommentSchema.index({ skinId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SkinComment', SkinCommentSchema);
