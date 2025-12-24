const mongoose = require('mongoose');
const ChampionRating = require('../../models/ChampionRating');
const ChampionStats = require('../../models/ChampionStats');
const RatingService = require('../../services/RatingService');
const { sendError } = require('../../utils/response');

// --- 1. THE CACHE & WRAPPER (Copy-Pasted for Safety) ---
const idToNameCache = new Map();

const withChampionName = (serviceFn) => async (req, res) => {
  try {
    const { championId } = req.params;

    // A. Validation
    if (!mongoose.Types.ObjectId.isValid(championId)) {
      return sendError(res, 'Invalid Champion ID format', { status: 400 });
    }

    // B. Cache Hit
    if (idToNameCache.has(championId)) {
      req.params.championName = idToNameCache.get(championId);
      return serviceFn(req, res);
    }

    // C. Cache Miss (Database Lookup)
    // We look up the ChampionStats doc to find the name
    const champ = await ChampionStats.findById(championId).select('championName').lean();
    
    if (!champ) {
      return sendError(res, 'Champion not found', { status: 404 });
    }

    // D. Write to Cache & Execute
    idToNameCache.set(championId, champ.championName);
    req.params.championName = champ.championName;
    return serviceFn(req, res);

  } catch (error) {
    console.error('Error resolving champion name:', error);
    return sendError(res, 'Server error resolving champion', { status: 500 });
  }
};

const RATING_FIELDS = [
  'funRating',
  'skillRating',
  'synergyRating',
  'laningRating',
  'teamfightRating',
  'opponentFrustrationRating',
  'teammateFrustrationRating',
];

// --- 2. UPDATED AGGREGATION LOGIC ---
// This function runs after a user submits a rating to update the averages
async function updateChampionAggregatedStats(championName) {
  try {
    const result = await ChampionRating.aggregate([
      // ✅ FIX: Match using championName (since you renamed the field in Schema)
      { $match: { championName } },
      {
        $group: {
          _id: '$championName', // Group by Name
          totalRatings: { $sum: 1 },
          avgFun: { $avg: '$funRating' },
          avgSkill: { $avg: '$skillRating' },
          avgSynergy: { $avg: '$synergyRating' },
          avgLaning: { $avg: '$laningRating' },
          avgTeamfight: { $avg: '$teamfightRating' },
          avgOpponentFrustration: { $avg: '$opponentFrustrationRating' },
          avgTeammateFrustration: { $avg: '$teammateFrustrationRating' },
        },
      },
    ]);

    const stats = result[0] || {
      totalRatings: 0,
      avgFun: 0,
      avgSkill: 0,
      avgSynergy: 0,
      avgLaning: 0,
      avgTeamfight: 0,
      avgOpponentFrustration: 0,
      avgTeammateFrustration: 0,
    };

    // ✅ FIX: Update the Stats document using the Name
    await ChampionStats.findOneAndUpdate(
      { championName }, 
      {
        $set: {
          totalRatings: stats.totalRatings,
          averageFunRating: Math.round(stats.avgFun * 10) / 10,
          averageSkillRating: Math.round(stats.avgSkill * 10) / 10,
          averageSynergyRating: Math.round(stats.avgSynergy * 10) / 10,
          averageLaningRating: Math.round(stats.avgLaning * 10) / 10,
          averageTeamfightRating: Math.round(stats.avgTeamfight * 10) / 10,
          averageOpponentFrustrationRating: Math.round(stats.avgOpponentFrustration * 10) / 10,
          averageTeammateFrustrationRating: Math.round(stats.avgTeammateFrustration * 10) / 10,
          lastAggregatedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  } catch (err) {
    console.error('Error aggregating champion stats:', err);
  }
}

// --- 3. UPDATED SERVICE CONFIG ---
const ratingService = new RatingService({
  RatingModel: ChampionRating,
  // ✅ FIX: Tell the service to look for 'championName' in req.params
  entityIdField: 'championName', 
  ratingFields: RATING_FIELDS,
  updateStatsFn: updateChampionAggregatedStats
});

// --- 4. WRAPPED EXPORTS ---
// Now valid for: POST /api/champions/671c.../rate
exports.rateChampion = withChampionName((req, res) => ratingService.rateEntity(req, res));
exports.getRatingsForChampion = withChampionName((req, res) => ratingService.getRatings(req, res));
exports.getUserChampionRating = withChampionName((req, res) => ratingService.getUserRating(req, res));