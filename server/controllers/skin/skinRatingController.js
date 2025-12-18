const SkinRating = require('../../models/SkinRating');
const Skin = require('../../models/Skin');
const RatingService = require('../../services/RatingService');

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
          averageSplashRating: Math.round(averageSplashRating * 10) / 10,
          averageModelRating: Math.round(averageModelRating * 10) / 10,
          totalNumberOfRatings: ratings.length,
        },
      },
    );
  } catch (err) {
    console.error('Error updating skin rating stats:', err);
  }
}

const ratingService = new RatingService({
  RatingModel: SkinRating,
  EntityModel: Skin,
  entityIdField: 'skinId',
  ratingFields: ['splashArtRating', 'inGameModelRating'],
  updateStatsFn: updateSkinRatingStats,
  idType: 'Number',
  ratingRange: { min: 1, max: 10 }
});

exports.rateSkin = (req, res) => ratingService.rateEntity(req, res);
exports.getRatingsForSkin = (req, res) => ratingService.getRatings(req, res);
exports.getUserRatingForSkin = (req, res) => ratingService.getUserRating(req, res);
