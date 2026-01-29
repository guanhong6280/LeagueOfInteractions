const mongoose = require('mongoose');

const PatchDiscussionPostSchema = new mongoose.Schema({
  // Post Content
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000,
    trim: true,
  },

  // Author
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Patch Context (for deletion of old patches)
  patchVersion: {
    type: String,
    required: true,
    index: true,
  }, // e.g., "14.23", "15.1"

  // Filters
  selectedChampion: {
    type: String,
    required: false,
    index: true,
  }, // Single champion for discussion focus

  selectedGameMode: {
    type: String,
    enum: [
      'Ranked Solo/Duo',
      'Ranked Flex',
      'Swift Play',
      'Draft Pick',
      'ARAM',
      'ARAM Mayhem',
      'Arena',
      'Ultimate Spellbook',
      'URF',
    ],
    required: false,
    index: true,
  }, // Single game mode for discussion focus

  // Engagement System (aligned with existing models)
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Engagement Metrics
  viewCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
    index: true,
  },

  // Moderation (following your existing pattern)
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

  // Soft delete for archiving
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date, default: null },

}, {
  timestamps: true,
  optimisticConcurrency: true,
});

// Virtuals
PatchDiscussionPostSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username profilePictureURL rank' },
});

PatchDiscussionPostSchema.virtual('likeCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

// Indexes for filtering and sorting
PatchDiscussionPostSchema.index({ patchVersion: 1, createdAt: -1 }); // New posts
PatchDiscussionPostSchema.index({ patchVersion: 1, commentCount: -1 }); // Most discussed
PatchDiscussionPostSchema.index({ selectedChampion: 1, patchVersion: 1 }); // Champion filter
PatchDiscussionPostSchema.index({ selectedGameMode: 1, patchVersion: 1 }); // Game mode filter
PatchDiscussionPostSchema.index({ userId: 1 }); // User's posts
PatchDiscussionPostSchema.index({ status: 1, isArchived: 1 }); // Moderation queries
PatchDiscussionPostSchema.index({ likedBy: 1 }); // For checking if user liked

// Virtuals in JSON
PatchDiscussionPostSchema.set('toJSON', { virtuals: true });
PatchDiscussionPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PatchDiscussionPost', PatchDiscussionPostSchema);
