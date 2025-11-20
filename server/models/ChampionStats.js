const mongoose = require('mongoose');

const ChampionStatsSchema = new mongoose.Schema({
  championId: { type: String, required: true, unique: true },

  // Aggregated Rating Averages
  averageFunRating: { type: Number, default: 0 },
  averageSkillRating: { type: Number, default: 0 },
  averageSynergyRating: { type: Number, default: 0 },
  averageLaningRating: { type: Number, default: 0 },
  averageTeamfightRating: { type: Number, default: 0 },
  averageOpponentFrustrationRating: { type: Number, default: 0 },
  averageTeammateFrustrationRating: { type: Number, default: 0 },

  totalRatings: { type: Number, default: 0 },
  
  // Comment Stats
  totalComments: { type: Number, default: 0 },

  // AI Summary
  championSummary: { type: String, default: '' },
  summaryGeneratedAt: { type: Date, default: null },

  lastAggregatedAt: { type: Date, default: null },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for looking up stats by champion
ChampionStatsSchema.index({ championId: 1 });

module.exports = mongoose.model('ChampionStats', ChampionStatsSchema);

