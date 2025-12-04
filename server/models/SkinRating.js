const mongoose = require('mongoose');

const SkinRatingSchema = new mongoose.Schema({
  skinId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Dual rating system
  splashArtRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  inGameModelRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },

  // Timestamps
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false },
});

// Create indexes for faster querying
SkinRatingSchema.index({ skinId: 1, userId: 1 }, { unique: true }); // One rating per user per skin
SkinRatingSchema.index({ skinId: 1 });
SkinRatingSchema.index({ userId: 1 });

module.exports = mongoose.model('SkinRating', SkinRatingSchema);
