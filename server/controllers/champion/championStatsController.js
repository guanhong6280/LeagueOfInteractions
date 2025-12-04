const Skin = require('../../models/Skin');
const SkinRating = require('../../models/SkinRating');
const SkinComment = require('../../models/SkinComment');
const ChampionStats = require('../../models/ChampionStats');

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
    const allChampionStatsDocs = await ChampionStats.find({});
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
    
    const responseData = {
      success: true,
      data: championStats,
      timestamp: new Date().toISOString()
    };

    // Update cache
    statsCache = {
      data: responseData,
      timestamp: Date.now(),
      duration: 5 * 60 * 1000
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error in champion stats aggregation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch champion statistics',
      error: error.message
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
    const championStatsDoc = await ChampionStats.findOne({ championId: championName });
    
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

    // --- Section 1: Skin Related Data (Expensive Aggregation) ---
    // Trigger if include contains 'skins' OR if no include param is provided (legacy/default behavior)
    if (!include || include.includes('skins')) {
      const skins = await Skin.find({ championId: championName });
      
      if (skins.length > 0) {
        const skinIds = skins.map(skin => skin.skinId);
        
        // We only need basic ratings/comments counts for the "Skin Section" logic?
        // Actually, "mostPopularSkin" needs aggregation over ALL ratings.
        const ratings = await SkinRating.find({ skinId: { $in: skinIds } });
        const comments = await SkinComment.find({ skinId: { $in: skinIds } });
        
        responseData.totalSkins = skins.length;
        responseData.totalRatings = ratings.length;
        responseData.totalComments = comments.length;

        // Calculate Average Rating
        if (ratings.length > 0) {
            const totalRatingSum = ratings.reduce((sum, r) => sum + (r.splashArtRating + r.inGameModelRating) / 2, 0);
            responseData.averageRating = Math.round((totalRatingSum / ratings.length) * 10) / 10;
        }

        // Rarity Distribution
        responseData.rarityDistribution = {};
        skins.forEach(skin => {
          const rarity = skin.rarity || 'kNoRarity';
          responseData.rarityDistribution[rarity] = (responseData.rarityDistribution[rarity] || 0) + 1;
        });

        // Most Popular Skin
        const skinRatingCounts = {};
        ratings.forEach(r => skinRatingCounts[r.skinId] = (skinRatingCounts[r.skinId] || 0) + 1);
        
        if (Object.keys(skinRatingCounts).length > 0) {
          const mostPopularSkinId = Object.keys(skinRatingCounts).reduce((a, b) => skinRatingCounts[a] > skinRatingCounts[b] ? a : b);
          const popularSkin = skins.find(s => s.skinId === parseInt(mostPopularSkinId));
          if (popularSkin) {
            responseData.mostPopularSkin = {
              name: popularSkin.name,
              skinId: popularSkin.skinId,
              ratingCount: skinRatingCounts[popularSkin.skinId]
            };
          }
        }

        // Highest Rated Skin
        const skinAvg = {};
        ratings.forEach(r => {
           if (!skinAvg[r.skinId]) skinAvg[r.skinId] = { total: 0, count: 0 };
           skinAvg[r.skinId].total += (r.splashArtRating + r.inGameModelRating) / 2;
           skinAvg[r.skinId].count++;
        });
        
        let highestRating = 0;
        let highestSkin = null;
        Object.keys(skinAvg).forEach(sId => {
            const avg = skinAvg[sId].total / skinAvg[sId].count;
            if (avg > highestRating) {
                highestRating = avg;
                highestSkin = skins.find(s => s.skinId === parseInt(sId));
            }
        });
        
        if (highestSkin) {
            responseData.highestRatedSkin = {
                name: highestSkin.name,
                skinId: highestSkin.skinId,
                averageRating: Math.round(highestRating * 10) / 10
            };
        }
        
        // Rating Distribution (1-10 Scale) - Used in Skin Stats
        responseData.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
        ratings.forEach(r => {
           const avg = Math.round((r.splashArtRating + r.inGameModelRating) / 2);
           if (avg >= 1 && avg <= 10) responseData.ratingDistribution[avg]++;
        });
      }
    }

    // --- Section 2: Champion Gameplay Ratings (Stats Model) ---
    // Trigger if include contains 'champions' OR if no include param is provided
    if (!include || include.includes('champions')) {
       if (championStatsDoc) {
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
    }
    
    // console.log(`Champion specific stats for ${championName}:`, responseData);
    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching champion specific stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch champion statistics',
      error: error.message
    });
  }
};

module.exports = {
  getChampionStats,
  getChampionSpecificStats
}; 