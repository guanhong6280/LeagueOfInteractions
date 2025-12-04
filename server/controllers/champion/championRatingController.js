const ChampionRating = require('../../models/ChampionRating');
const ChampionStats = require('../../models/ChampionStats');
const RatingService = require('../../services/RatingService');

const RATING_FIELDS = [
  'funRating',
  'skillRating',
  'synergyRating',
  'laningRating',
  'teamfightRating',
  'opponentFrustrationRating',
  'teammateFrustrationRating',
];

async function updateChampionAggregatedStats(championId) {
  try {
    const result = await ChampionRating.aggregate([
      { $match: { championId } },
      {
        $group: {
          _id: '$championId',
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

    await ChampionStats.findOneAndUpdate(
      { championId },
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

const ratingService = new RatingService({
  RatingModel: ChampionRating,
  entityIdField: 'championId',
  userHistoryField: 'recentChampionRatings',
  ratingFields: RATING_FIELDS,
  updateStatsFn: updateChampionAggregatedStats
});

exports.rateChampion = (req, res) => ratingService.rateEntity(req, res);
exports.getUserChampionRating = (req, res) => ratingService.getUserRating(req, res);
// Add getRatings for consistency if needed, though not in original file
// exports.getRatingsForChampion = (req, res) => ratingService.getRatings(req, res);
