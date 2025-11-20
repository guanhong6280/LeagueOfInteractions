const ChampionRating = require('../models/ChampionRating');
const ChampionStats = require('../models/ChampionStats');
const User = require('../models/User');

const RATING_FIELDS = [
  'funRating',
  'skillRating',
  'synergyRating',
  'laningRating',
  'teamfightRating',
  'opponentFrustrationRating',
  'teammateFrustrationRating',
];

async function updateUserRecentChampionRatings(userId, ratingDoc) {
  try {
    const {
      championId,
      lastUpdated,
      funRating,
      skillRating,
      synergyRating,
      laningRating,
      teamfightRating,
      opponentFrustrationRating,
      teammateFrustrationRating,
    } = ratingDoc;
    
    // Remove existing entry for this champion if it exists
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          recentChampionRatings: { championId },
        },
      }
    );

    // Add new entry to the beginning of the array
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          recentChampionRatings: {
            $each: [{
              championId,
              dateUpdated: lastUpdated,
              funRating,
              skillRating,
              synergyRating,
              laningRating,
              teamfightRating,
              opponentFrustrationRating,
              teammateFrustrationRating,
            }],
            $position: 0,
            $slice: 10, // Keep only latest 10
          },
        },
      }
    );
  } catch (err) {
    console.error('Error updating user champion rating history:', err);
  }
}

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

exports.rateChampion = async (req, res) => {
  try {
    const { championId } = req.params;
    const userId = req.user._id;
    const ratings = req.body; // Expects { funRating: 8, skillRating: 5, ... }

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({ success: false, error: 'Champion ID is required.' });
    }

    // Validate ratings
    for (const field of RATING_FIELDS) {
      if (ratings[field] === undefined) {
        return res.status(400).json({ success: false, error: `Missing rating field: ${field}` });
      }
      const val = Number(ratings[field]);
      if (Number.isNaN(val) || val < 1 || val > 10) {
        return res.status(400).json({ success: false, error: `Invalid value for ${field}. Must be 1-10.` });
      }
    }

    const updatePayload = {
      championId: normalizedChampionId,
      userId,
      ...ratings,
      lastUpdated: new Date(),
    };

    const ratingDoc = await ChampionRating.findOneAndUpdate(
      { championId: normalizedChampionId, userId },
      {
        $set: updatePayload,
        $setOnInsert: { dateCreated: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Trigger aggregation asynchronously
    updateChampionAggregatedStats(normalizedChampionId);
    
    // Update user history
    await updateUserRecentChampionRatings(userId, ratingDoc);

    res.json({
      success: true,
      data: ratingDoc,
      message: 'Champion rating submitted successfully.',
    });
  } catch (err) {
    console.error('Error rating champion:', err);
    res.status(500).json({ success: false, error: 'Failed to submit rating.', message: err.message });
  }
};

exports.getUserChampionRating = async (req, res) => {
  try {
    const { championId } = req.params;
    const userId = req.user._id;

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({ success: false, error: 'Champion ID is required.' });
    }

    const rating = await ChampionRating.findOne({ championId: normalizedChampionId, userId });

    res.json({
      success: true,
      data: rating || null,
    });
  } catch (err) {
    console.error('Error fetching user champion rating:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch rating.', message: err.message });
  }
};

