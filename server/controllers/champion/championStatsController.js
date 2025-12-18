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
          _id: '$championId',
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
          championId: '$_id',
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
        $sort: { championId: 1 }
      }
    ];

    console.log('Executing aggregation pipeline...');
    const results = await Skin.aggregate(pipeline);
    
    // Transform results into the format expected by frontend
    const championStats = {};
    results.forEach(result => {
      championStats[result.championId] = result.stats;
    });

    // Merge in the ChampionStats (new model) data
    const allChampionStatsDocs = await ChampionStats.find({}).lean();
    allChampionStatsDocs.forEach((doc) => {
      // Ensure we have an object for this champion even if pipeline didn't return stats (no skins rated/no skins)
      if (!championStats[doc.championId]) {
        championStats[doc.championId] = {};
      }
      
      // Merge existing stats with new persistent metadata & rating stats
      // Only include fields needed for Landing Page
      championStats[doc.championId] = {
        ...championStats[doc.championId],
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
    const { championName } = req.params;
    const { include } = req.query; // 'skins' or 'champions' or both (comma separated)

    console.log(`Fetching detailed stats for champion: ${championName} (include: ${include || 'all'})`);

    // Always fetch basic static data (Title, Roles, Name)
    const championStatsDoc = await ChampionStats.findOne({ championId: championName }).lean();

    let responseData = {
      // Static Data (Always Included)
      title: championStatsDoc?.title || '',
      roles: championStatsDoc?.roles || [],
      damageType: championStatsDoc?.damageType || '',
      playstyleInfo: championStatsDoc?.playstyleInfo || null,

      // Default nulls for optional sections
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

    // --- Section 1: Skin Related Data (Aggregated) ---
    if (includeSkins) {
      // Fetch skins (lean) for metadata and rarity counts
      const skins = await Skin.find({ championId: championName }).lean();
      if (skins.length > 0) {
        const skinIds = skins.map((skin) => skin.skinId);
        responseData.totalSkins = skins.length;

        // Rarity distribution from skins themselves (no extra queries)
        const rarityDistribution = {};
        skins.forEach((skin) => {
          const rarity = skin.rarity || 'kNoRarity';
          rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + 1;
        });
        responseData.rarityDistribution = rarityDistribution;

        // Aggregate ratings: count, avg, distribution, most popular, highest rated
        const ratingsAgg = await SkinRating.aggregate([
          { $match: { skinId: { $in: skinIds } } },
          {
            $group: {
              _id: '$skinId',
              ratingCount: { $sum: 1 },
              avgScore: {
                $avg: { $divide: [{ $add: ['$splashArtRating', '$inGameModelRating'] }, 2] },
              },
              // distribution 1-10
              dist: {
                $push: { $round: { $divide: [{ $add: ['$splashArtRating', '$inGameModelRating'] }, 2] } },
              },
            },
          },
        ]);

        // Aggregate comments count
        const commentsCount = await SkinComment.countDocuments({ skinId: { $in: skinIds } });
        responseData.totalComments = commentsCount;

        // Compute totals and distributions without materializing all ratings
        let totalRatings = 0;
        let weightedSum = 0;
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };

        let mostPopular = null; // { skinId, ratingCount }
        let highestRated = null; // { skinId, avgScore }

        ratingsAgg.forEach((entry) => {
          totalRatings += entry.ratingCount;
          weightedSum += (entry.avgScore || 0) * entry.ratingCount;

          if (!mostPopular || entry.ratingCount > mostPopular.ratingCount) {
            mostPopular = { skinId: entry._id, ratingCount: entry.ratingCount };
          }

          if (!highestRated || (entry.avgScore || 0) > (highestRated.avgScore || 0)) {
            highestRated = { skinId: entry._id, avgScore: entry.avgScore || 0 };
          }

          // distribution
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
          if (popularSkin) {
            responseData.mostPopularSkin = {
              name: popularSkin.name,
              skinId: popularSkin.skinId,
              ratingCount: mostPopular.ratingCount,
            };
          }
        }

        if (highestRated) {
          const highestSkin = skins.find((s) => s.skinId === highestRated.skinId);
          if (highestSkin) {
            responseData.highestRatedSkin = {
              name: highestSkin.name,
              skinId: highestSkin.skinId,
              averageRating: Math.round((highestRated.avgScore || 0) * 10) / 10,
            };
          }
        }
      }
    }

    // --- Section 2: Champion Gameplay Ratings (Stats Model) ---
    if (includeChampionRatings && championStatsDoc) {
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