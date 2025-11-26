const mongoose = require('mongoose');

const ChampionStatsSchema = new mongoose.Schema({
  championId: { type: String, required: true, unique: true },

  // Metadata from Community Dragon
  title: { type: String, default: '' },
  roles: [{ type: String }], // e.g. ["marksman", "mage"]
  damageType: { type: String, default: '' }, // e.g. "kPhysical", "kMagic"
  playstyleInfo: {
    damage: { type: Number, default: 0 },
    durability: { type: Number, default: 0 },
    crowdControl: { type: Number, default: 0 },
    mobility: { type: Number, default: 0 },
    utility: { type: Number, default: 0 },
  },

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
