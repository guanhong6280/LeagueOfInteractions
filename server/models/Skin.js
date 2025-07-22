const mongoose = require('mongoose');

const SkinSchema = new mongoose.Schema({
  championId: { type: String, required: true },
  skinId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  rarity: { type: String, default: 'kNoRarity' },
  splashPath: { type: String },
  loadScreenPath: { type: String },
  skinLineId: { type: Number }, // For grouping skins by skin line (e.g., Project, Star Guardian)
  description: { type: String },

  // Aggregated statistics for performance
  averageSplashRating: { type: Number, default: 0 },
  averageModelRating: { type: Number, default: 0 },
  totalNumberOfRatings: { type: Number, default: 0 },
  totalNumberOfComments: { type: Number, default: 0 },

  // Metadata
  dateCreated: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

// Create indexes for faster querying
SkinSchema.index({ championId: 1, skinId: 1 });
SkinSchema.index({ skinId: 1 }, { unique: true });
SkinSchema.index({ skinLineId: 1 }); // For skin line analytics

module.exports = mongoose.model('Skin', SkinSchema);
