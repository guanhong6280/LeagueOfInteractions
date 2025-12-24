const mongoose = require('mongoose');

const SkinSchema = new mongoose.Schema({
  championName: { type: String, required: true },
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

  // Summary pipeline fields (Week 1 addition)
  skinSummary: { type: String, default: '' },
  summaryGeneratedAt: { type: Date, default: null },

  // Metadata
  dateCreated: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

// Create indexes for faster querying
SkinSchema.index({ championName: 1, skinId: 1 });
SkinSchema.index({ skinId: 1 }, { unique: true });
SkinSchema.index({ skinLineId: 1 }); // For skin line analytics

// Summary workflow index (Week 1 addition)
SkinSchema.index({ summaryGeneratedAt: 1 });

module.exports = mongoose.model('Skin', SkinSchema);
