const mongoose = require('mongoose');

const ChampionRatingSchema = new mongoose.Schema({
  championName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Rating Dimensions (1-10 scale)
  funRating: { type: Number, min: 1, max: 10, required: true }, // How enjoyable to play
  skillRating: { type: Number, min: 1, max: 10, required: true }, // Difficulty/Mastery
  synergyRating: { type: Number, min: 1, max: 10, required: true }, // Kit cohesion
  laningRating: { type: Number, min: 1, max: 10, required: true }, // Laning phase strength
  teamfightRating: { type: Number, min: 1, max: 10, required: true }, // Teamfight impact
  opponentFrustrationRating: { type: Number, min: 1, max: 10, required: true }, // Unfair/Annoying to play against
  teammateFrustrationRating: { type: Number, min: 1, max: 10, required: true }, // Annoying to have on team (e.g. Yasuo syndrome)

  dateCreated: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

// Indexes
ChampionRatingSchema.index({ championName: 1, userId: 1 }, { unique: true }); // One rating per user per champion
ChampionRatingSchema.index({ championName: 1 }); // For aggregation queries

module.exports = mongoose.model('ChampionRating', ChampionRatingSchema);

