const Skin = require('../models/Skin');
const SkinRating = require('../models/SkinRating');
const SkinComment = require('../models/SkinComment');
const ChampionStats = require('../models/ChampionStats');

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
          // Calculate average of (splash + model) / 2 for each skin, then average across all skins
          averageSkinRating: { 
            $avg: {
              $avg: ['$averageSplashRating', '$averageModelRating']
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
            // Round to 1 decimal place
            averageSkinRating: { $round: ['$averageSkinRating', 1] }
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
    
    console.log(`Fetching detailed stats for champion: ${championName}`);
    
    // Get all skins for this champion
    const skins = await Skin.find({ championId: championName });
    
    if (skins.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found or no skins available'
      });
    }

    const skinIds = skins.map(skin => skin.skinId);
    
    // Get all ratings for this champion's skins
    const ratings = await SkinRating.find({ skinId: { $in: skinIds } });
    
    // Get all comments for this champion's skins
    const comments = await SkinComment.find({ skinId: { $in: skinIds } });
    
    // Calculate detailed statistics
    const totalSkins = skins.length;
    const totalRatings = ratings.length;
    const totalComments = comments.length;
    
    // Calculate average rating
    let averageRating = 0;
    if (totalRatings > 0) {
      try {
        const totalRatingSum = ratings.reduce((sum, rating) => {
          return sum + (rating.splashArtRating + rating.inGameModelRating) / 2;
        }, 0);
        averageRating = Math.round((totalRatingSum / totalRatings) * 10) / 10;
      } catch (error) {
        console.error('Error calculating average rating:', error);
        averageRating = 0;
      }
    }
    
    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      const avgRating = Math.round((rating.splashArtRating + rating.inGameModelRating) / 2);
      if (avgRating >= 1 && avgRating <= 5) {
        ratingDistribution[avgRating]++;
      }
    });
    
    // Calculate rarity distribution
    const rarityDistribution = {};
    skins.forEach(skin => {
      const rarity = skin.rarity || 'kNoRarity';
      rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + 1;
    });
    
    // Find most popular skin (most rated)
    const skinRatingCounts = {};
    ratings.forEach(rating => {
      skinRatingCounts[rating.skinId] = (skinRatingCounts[rating.skinId] || 0) + 1;
    });
    
    let mostPopularSkin = null;
    if (Object.keys(skinRatingCounts).length > 0) {
      const mostPopularSkinId = Object.keys(skinRatingCounts).reduce((a, b) => 
        skinRatingCounts[a] > skinRatingCounts[b] ? a : b
      );
      mostPopularSkin = skins.find(skin => skin.skinId === parseInt(mostPopularSkinId));
    }
    
    // Find highest rated skin
    const skinAverageRatings = {};
    ratings.forEach(rating => {
      if (!skinAverageRatings[rating.skinId]) {
        skinAverageRatings[rating.skinId] = { total: 0, count: 0 };
      }
      skinAverageRatings[rating.skinId].total += (rating.splashArtRating + rating.inGameModelRating) / 2;
      skinAverageRatings[rating.skinId].count += 1;
    });
    
    let highestRatedSkin = null;
    let highestRating = 0;
    
    if (Object.keys(skinAverageRatings).length > 0) {
      Object.keys(skinAverageRatings).forEach(skinId => {
        const avgRating = skinAverageRatings[skinId].total / skinAverageRatings[skinId].count;
        if (avgRating > highestRating) {
          highestRating = avgRating;
          highestRatedSkin = skins.find(skin => skin.skinId === parseInt(skinId));
        }
      });
    }

    // Fetch ChampionStats for this specific champion
    const championStatsDoc = await ChampionStats.findOne({ championId: championName });
    
    const stats = {
      totalSkins,
      totalRatings,
      totalComments,
      averageRating,
      ratingDistribution,
      rarityDistribution,
      mostPopularSkin: mostPopularSkin ? {
        name: mostPopularSkin.name,
        skinId: mostPopularSkin.skinId,
        ratingCount: skinRatingCounts[mostPopularSkin.skinId] || 0
      } : null,
      highestRatedSkin: highestRatedSkin ? {
        name: highestRatedSkin.name,
        skinId: highestRatedSkin.skinId,
        averageRating: Math.round(highestRating * 10) / 10
      } : null,
      championRatingStats: championStatsDoc ? {
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
      } : null,
      // Include static data for Detail Pages to avoid extra fetch
      title: championStatsDoc?.title || '',
      roles: championStatsDoc?.roles || [],
      damageType: championStatsDoc?.damageType || '',
      playstyleInfo: championStatsDoc?.playstyleInfo || null,
      tags: championStatsDoc?.roles || [], // Helper for legacy support
    };
    
    // console.log(`Champion specific stats for ${championName}:`, stats);
    res.json({
      success: true,
      data: stats,
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