const mongoose = require('mongoose');
const Skin = require('../../models/Skin');
const SkinRating = require('../../models/SkinRating');
const SkinComment = require('../../models/SkinComment');
const ChampionStats = require('../../models/ChampionStats');
const { buildSuccess, sendSuccess, sendError } = require('../../utils/response');

// Simple in-memory cache for landing page stats
let statsCache = {
  data: null,
  timestamp: 0,
  duration: 5 * 60 * 1000 // 5 minutes
};

/**
 * Get aggregated statistics for all champions
 * This uses MongoDB aggregation pipeline for efficient data processing
 */
const getChampionStats = async (req, res) => {
  try {
    // Check cache
    if (statsCache.data && (Date.now() - statsCache.timestamp < statsCache.duration)) {
      console.log('Serving champion stats from cache');
      return res.json(statsCache.data);
    }

    console.log('Starting champion stats aggregation...');
    
    // Optimized MongoDB Aggregation Pipeline
    // Removed comments lookup and complex distribution calc since they aren't used on landing page
    // FURTHER OPTIMIZATION: Removed ratings lookup by using pre-aggregated fields on Skin model
    const pipeline = [
      // Stage 1: Group skins by champion and calculate stats directly from Skin model
      {
        $group: {
          _id: '$championName',
          totalSkins: { $sum: 1 },
          totalRatings: { $sum: '$totalNumberOfRatings' },
          // Calculate weighted sum: ((AvgSplash + AvgModel) / 2) * Count
          // Explicitly exclude skins with 0 ratings to ensure no participation in calculation
          weightedSum: {
            $sum: {
              $cond: [
                { $gt: ['$totalNumberOfRatings', 0] },
                {
                  $multiply: [
                    { $avg: ['$averageSplashRating', '$averageModelRating'] },
                    '$totalNumberOfRatings'
                  ]
                },
                0
              ]
            }
          }
        }
      },
      
      // Stage 2: Project final result
      {
        $project: {
          _id: 0,
          championName: '$_id',
          stats: {
            totalSkins: '$totalSkins',
            // Calculate weighted average: WeightedSum / TotalRatings
            averageSkinRating: {
              $cond: {
                if: { $eq: ['$totalRatings', 0] },
                then: 0,
                else: { $round: [{ $divide: ['$weightedSum', '$totalRatings'] }, 1] }
              }
            }
          }
        }
      },
      
      // Stage 3: Sort by champion name
      {
        $sort: { championName: 1 }
      }
    ];

    console.log('Executing aggregation pipeline...');
    const results = await Skin.aggregate(pipeline);
    
    // Transform results into the format expected by frontend
    const championStats = {};
    results.forEach(result => {
      championStats[result.championName] = result.stats;
    });

    // Merge in the ChampionStats (new model) data
    const allChampionStatsDocs = await ChampionStats.find({}).lean();
    allChampionStatsDocs.forEach((doc) => {
      // Ensure we have an object for this champion even if pipeline didn't return stats (no skins rated/no skins)
      if (!championStats[doc.championName]) {
        championStats[doc.championName] = {};
      }
      
      // Merge existing stats with new persistent metadata & rating stats
      // Only include fields needed for Landing Page
      championStats[doc.championName] = {
        ...championStats[doc.championName],
        // Add stable ID for future-proofing (surrogate key)
        id: doc._id?.toString() || null,
        roles: doc.roles,
        damageType: doc.damageType,
        championRatingStats: {
          avgFun: doc.averageFunRating,
        },
      };
    });

    console.log(`Aggregation complete. Processed ${results.length} champions.`);
    
    const responseData = buildSuccess(championStats, null);
    responseData.timestamp = new Date().toISOString();

    // Update cache
    statsCache = {
      data: responseData,
      timestamp: Date.now(),
      duration: 5 * 60 * 1000
    };

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    sendSuccess(res, responseData.data, {
      extra: { timestamp: responseData.timestamp },
    });

  } catch (error) {
    console.error('Error in champion stats aggregation:', error);
    sendError(res, 'Failed to fetch champion statistics', {
      status: 500,
      errorCode: 'CHAMPION_STATS_FETCH_FAILED',
      data: null,
    });
  }
};

/**
 * Get detailed statistics for a specific champion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getChampionSpecificStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    // 1. SECURITY: Fail fast if 'id' is not a valid MongoDB ObjectId
    // This prevents the "CastError" crash if someone uses an old link like /champion/Aatrox
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid Champion ID format provided.', { 
        status: 400, 
        errorCode: 'INVALID_ID_FORMAT' 
      });
    }

    console.log(`Fetching detailed stats for ID: ${id}`);

    // 2. FETCH: Strict lookup by Database _id
    const championStatsDoc = await ChampionStats.findById(id).lean();

    if (!championStatsDoc) {
      return sendError(res, 'Champion not found', { status: 404 });
    }

    // 3. PREPARE RESPONSE
    // We now have the "Golden Record". We extract the Name to find related skins.
    const currentChampionName = championStatsDoc.championName;

    let responseData = {
      id: championStatsDoc._id.toString(),
      championName: currentChampionName, // <--- Used for Display & Skin Lookup
      
      title: championStatsDoc.title || '',
      roles: championStatsDoc.roles || [],
      damageType: championStatsDoc.damageType || '',
      playstyleInfo: championStatsDoc.playstyleInfo || null,

      // Defaults
      totalSkins: 0,
      totalRatings: 0,
      totalComments: 0,
      averageRating: 0,
      ratingDistribution: null,
      rarityDistribution: null,
      mostPopularSkin: null,
      highestRatedSkin: null,
      championRatingStats: null,
    };

    const includeSkins = !include || include.includes('skins');
    const includeChampionRatings = !include || include.includes('champions');

    // --- Section 1: Skin Related Data ---
    if (includeSkins) {
      // ✅ THE BRIDGE: Use the Name we just found to get the skins
      // (Because Skins are stored with championName: "Annie", not the ID)
      const skins = await Skin.find({ championName: currentChampionName }).lean();
      
      if (skins.length > 0) {
        // ... (This logic remains exactly the same as before) ...
        const skinIds = skins.map((skin) => skin.skinId);
        responseData.totalSkins = skins.length;

        const rarityDistribution = {};
        skins.forEach((skin) => {
            const rarity = skin.rarity || 'kNoRarity';
            rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + 1;
        });
        responseData.rarityDistribution = rarityDistribution;

        const ratingsAgg = await SkinRating.aggregate([
          { $match: { skinId: { $in: skinIds } } },
          {
            $group: {
              _id: '$skinId',
              ratingCount: { $sum: 1 },
              avgScore: {
                $avg: { $divide: [{ $add: ['$splashArtRating', '$inGameModelRating'] }, 2] },
              },
              dist: {
                $push: { $round: { $divide: [{ $add: ['$splashArtRating', '$inGameModelRating'] }, 2] } },
              },
            },
          },
        ]);

        const commentsCount = await SkinComment.countDocuments({ skinId: { $in: skinIds } });
        responseData.totalComments = commentsCount;

        // Calculations
        let totalRatings = 0;
        let weightedSum = 0;
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
        let mostPopular = null;
        let highestRated = null;

        ratingsAgg.forEach((entry) => {
          totalRatings += entry.ratingCount;
          weightedSum += (entry.avgScore || 0) * entry.ratingCount;

          if (!mostPopular || entry.ratingCount > mostPopular.ratingCount) {
            mostPopular = { skinId: entry._id, ratingCount: entry.ratingCount };
          }
          if (!highestRated || (entry.avgScore || 0) > (highestRated.avgScore || 0)) {
            highestRated = { skinId: entry._id, avgScore: entry.avgScore || 0 };
          }
          (entry.dist || []).forEach((score) => {
            if (score >= 1 && score <= 10) {
              ratingDistribution[score] = (ratingDistribution[score] || 0) + 1;
            }
          });
        });

        responseData.totalRatings = totalRatings;
        responseData.averageRating = totalRatings > 0 ? Math.round((weightedSum / totalRatings) * 10) / 10 : 0;
        responseData.ratingDistribution = ratingDistribution;

        if (mostPopular) {
          const popularSkin = skins.find((s) => s.skinId === mostPopular.skinId);
          if (popularSkin) responseData.mostPopularSkin = { name: popularSkin.name, skinId: popularSkin.skinId, ratingCount: mostPopular.ratingCount };
        }
        if (highestRated) {
          const highestSkin = skins.find((s) => s.skinId === highestRated.skinId);
          if (highestSkin) responseData.highestRatedSkin = { name: highestSkin.name, skinId: highestSkin.skinId, averageRating: Math.round((highestRated.avgScore || 0) * 10) / 10 };
        }
      }
    }

    // --- Section 2: Champion Gameplay Ratings ---
    if (includeChampionRatings) {
      responseData.championRatingStats = {
        avgFun: championStatsDoc.averageFunRating,
        avgSkill: championStatsDoc.averageSkillRating,
        avgSynergy: championStatsDoc.averageSynergyRating,
        avgLaning: championStatsDoc.averageLaningRating,
        avgTeamfight: championStatsDoc.averageTeamfightRating,
        avgOpponentFrustration: championStatsDoc.averageOpponentFrustrationRating,
        avgTeammateFrustration: championStatsDoc.averageTeammateFrustrationRating,
        totalRatings: championStatsDoc.totalRatings,
        totalComments: championStatsDoc.totalComments,
        summary: championStatsDoc.championSummary,
      };
    }

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    sendSuccess(res, responseData, {
      extra: { timestamp: new Date().toISOString() },
    });

  } catch (error) {
    console.error('Error fetching champion specific stats:', error);
    sendError(res, 'Failed to fetch champion statistics', {
      status: 500,
      errorCode: 'CHAMPION_STATS_FETCH_FAILED',
      data: null,
    });
  }
};

module.exports = {
  getChampionStats,
  getChampionSpecificStats
};

module.exports = {
  getChampionStats,
  getChampionSpecificStats
}; 