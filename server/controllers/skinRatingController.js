const SkinRating = require('../models/SkinRating');
const Skin = require('../models/Skin');
const User = require('../models/User');

/**
 * Submit or update a user's rating for a skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rateSkin = async (req, res) => {
  try {
    const { skinId } = req.params;
    const { splashArtRating, inGameModelRating } = req.body;
    const userId = req.user._id; // Middleware ensures user is authenticated

    // Validate input
    if (!splashArtRating || !inGameModelRating) {
      return res.status(400).json({
        success: false,
        error: 'Both splashArtRating and inGameModelRating are required.',
      });
    }

    if (splashArtRating < 1 || splashArtRating > 5 || inGameModelRating < 1 || inGameModelRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Ratings must be between 1 and 5.',
      });
    }

    // Check if skin exists
    const skin = await Skin.findOne({ skinId: Number(skinId) });
    if (!skin) {
      return res.status(404).json({
        success: false,
        error: 'Skin not found.',
      });
    }

    // Create or update rating
    const ratingData = {
      skinId: Number(skinId),
      userId,
      splashArtRating,
      inGameModelRating,
      dateUpdated: new Date(),
    };

    const existingRating = await SkinRating.findOne({ skinId: Number(skinId), userId });

    if (existingRating) {
      // Update existing rating
      ratingData.isEdited = true;
      await SkinRating.updateOne(
        { skinId: Number(skinId), userId },
        { $set: ratingData },
      );
    } else {
      // Create new rating
      ratingData.dateCreated = new Date();
      ratingData.isEdited = false;
      await SkinRating.create(ratingData);
    }

    // Update skin's aggregated stats
    await updateSkinRatingStats(Number(skinId));

    // Update user's recent rating history
    await updateUserRecentRatings(userId, existingRating, ratingData);

    res.json({
      success: true,
      message: existingRating ? 'Rating updated successfully.' : 'Rating submitted successfully.',
      data: ratingData,
    });
  } catch (err) {
    console.error('Error rating skin:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit rating.',
      message: err.message,
    });
  }
};

/**
 * Get all ratings for a specific skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRatingsForSkin = async (req, res) => {
  try {
    const { skinId } = req.params;
    const { includeUserDetails = false } = req.query;

    // Check if skin exists
    const skin = await Skin.findOne({ skinId: Number(skinId) });
    if (!skin) {
      return res.status(404).json({
        success: false,
        error: 'Skin not found.',
      });
    }

    let query = SkinRating.find({ skinId: Number(skinId) });

    if (includeUserDetails === 'true') {
      query = query.populate('userId', 'username profilePictureURL');
    }

    const ratings = await query.sort({ dateCreated: -1 });

    res.json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ratings.',
      message: err.message,
    });
  }
};

/**
 * Get a specific user's rating for a skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserRatingForSkin = async (req, res) => {
  try {
    const { skinId } = req.params;
    const userId = req.user._id; // Middleware ensures user is authenticated

    const rating = await SkinRating.findOne({
      skinId: Number(skinId),
      userId,
    });

    res.json({
      success: true,
      data: rating || null,
    });
  } catch (err) {
    console.error('Error fetching user rating:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user rating.',
      message: err.message,
    });
  }
};

/**
 * Helper function to update skin's aggregated rating statistics.
 * @param {Number} skinId - The skin ID
 */
async function updateSkinRatingStats(skinId) {
  try {
    const ratings = await SkinRating.find({ skinId });

    if (ratings.length === 0) return;

    const totalSplashRating = ratings.reduce((sum, rating) => sum + rating.splashArtRating, 0);
    const totalModelRating = ratings.reduce((sum, rating) => sum + rating.inGameModelRating, 0);

    const averageSplashRating = totalSplashRating / ratings.length;
    const averageModelRating = totalModelRating / ratings.length;

    await Skin.updateOne(
      { skinId },
      {
        $set: {
          averageSplashRating: Math.round(averageSplashRating * 10) / 10, // Round to 1 decimal
          averageModelRating: Math.round(averageModelRating * 10) / 10,
          totalNumberOfRatings: ratings.length,
        },
      },
    );
  } catch (err) {
    console.error('Error updating skin rating stats:', err);
  }
}

/**
 * Helper function to update user's recent rating history.
 * @param {ObjectId} userId - The user ID
 * @param {Boolean} existingRating - Whether this is an update to an existing rating
 * @param {Object} ratingData - The rating data
 */
async function updateUserRecentRatings(userId, existingRating, ratingData) {
  try {
    // Extract only the fields we need for the history
    const { skinId, dateUpdated, splashArtRating, inGameModelRating } = ratingData;
    const historyEntry = { skinId, dateUpdated, splashArtRating, inGameModelRating };

    if (!existingRating) {
      // NEW rating: add to recent ratings
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            recentSkinRatings: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        },
      );
    } else {
      // EXISTING rating: update the entry in recent ratings
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            recentSkinRatings: { skinId: ratingData.skinId },
          },
        },
      );

      // Then add the updated entry to the beginning
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            recentSkinRatings: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        },
      );
    }
  } catch (err) {
    console.error('Error updating user rating history:', err);
  }
}
