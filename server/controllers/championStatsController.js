const Skin = require('../models/Skin');
const SkinRating = require('../models/SkinRating');
const SkinComment = require('../models/SkinComment');

/**
 * Get aggregated statistics for all champions
 * This uses MongoDB aggregation pipeline for efficient data processing
 */
const getChampionStats = async (req, res) => {
  try {
    console.log('Starting champion stats aggregation...');
    
    // Optimized MongoDB Aggregation Pipeline
    // Since users can only rate/comment on one skin per champion, we can simplify significantly
    const pipeline = [
      // Stage 1: Group skins by champion and get basic counts
      {
        $group: {
          _id: '$championId',
          totalSkins: { $sum: 1 },
          skinIds: { $push: '$skinId' }  // Just collect skin IDs for lookups
        }
      },
      
      // Stage 2: Lookup ratings (one per user per champion)
      {
        $lookup: {
          from: 'skinratings',
          localField: 'skinIds',
          foreignField: 'skinId',
          as: 'ratings'
        }
      },
      
      // Stage 3: Lookup comments (one per user per champion)
      {
        $lookup: {
          from: 'skincomments',
          localField: 'skinIds',
          foreignField: 'skinId',
          as: 'comments'
        }
      },
      
      // Stage 4: Calculate simplified statistics
      {
        $addFields: {
          championStats: {
            totalSkins: '$totalSkins',
            totalRatings: { $size: '$ratings' },
            totalComments: { $size: '$comments' },
            
            // Simplified average calculation (one rating per user)
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$ratings' }, 0] },
                then: {
                  $round: [
                    {
                      $avg: {
                        $map: {
                          input: '$ratings',
                          as: 'rating',
                          in: {
                            $avg: ['$$rating.splashArtRating', '$$rating.inGameModelRating']
                          }
                        }
                      }
                    },
                    1
                  ]
                },
                else: 0
              }
            },
            
            // Simplified rating distribution (one rating per user)
            ratingDistribution: {
              $reduce: {
                input: '$ratings',
                initialValue: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $let: {
                        vars: {
                          avgRating: {
                            $round: [
                              { $avg: ['$$this.splashArtRating', '$$this.inGameModelRating'] },
                              0
                            ]
                          }
                        },
                        in: {
                          $switch: {
                            branches: [
                              { case: { $eq: ['$$avgRating', 1] }, then: { 1: { $add: ['$$value.1', 1] } } },
                              { case: { $eq: ['$$avgRating', 2] }, then: { 2: { $add: ['$$value.2', 1] } } },
                              { case: { $eq: ['$$avgRating', 3] }, then: { 3: { $add: ['$$value.3', 1] } } },
                              { case: { $eq: ['$$avgRating', 4] }, then: { 4: { $add: ['$$value.4', 1] } } },
                              { case: { $eq: ['$$avgRating', 5] }, then: { 5: { $add: ['$$value.5', 1] } } }
                            ],
                            default: '$$value'
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      
      // Stage 5: Project final result
      {
        $project: {
          _id: 0,
          championId: '$_id',
          stats: '$championStats'
        }
      },
      
      // Stage 6: Sort by champion name
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

    console.log(`Aggregation complete. Processed ${results.length} champions.`);
    res.json({
      success: true,
      data: championStats,
      timestamp: new Date().toISOString()
    });

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
      } : null
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