const { sendSuccess, sendError } = require('../utils/response');

class RatingService {
  /**
   * @param {Object} config
   * @param {Object} config.RatingModel - Mongoose Model for ratings
   * @param {Object} [config.EntityModel] - Mongoose Model for entity validation (optional)
   * @param {String} config.entityIdField - Field name for entity ID (e.g. 'championName', 'skinId')
   * @param {Array<String>} config.ratingFields - Array of rating field names to validate/update
   * @param {Function} [config.updateStatsFn] - Function to update aggregated stats
   * @param {String} [config.idType='String'] - Type of ID ('String' or 'Number')
   * @param {Object} [config.ratingRange={min: 1, max: 10}] - Range for ratings
   */
  constructor({
    RatingModel,
    EntityModel,
    entityIdField,
    ratingFields,
    updateStatsFn,
    idType = 'String',
    ratingRange = { min: 1, max: 10 }
  }) {
    this.RatingModel = RatingModel;
    this.EntityModel = EntityModel;
    this.entityIdField = entityIdField;
    this.ratingFields = ratingFields;
    this.updateStatsFn = updateStatsFn;
    this.idType = idType;
    this.ratingRange = ratingRange;
  }

  normalizeId(id) {
    if (this.idType === 'Number') {
      const num = Number(id);
      return isNaN(num) ? null : num;
    }
    return String(id).trim() || null;
  }

  async validateEntity(id) {
    if (this.EntityModel) {
      const query = {};
      query[this.entityIdField] = id;
      return !!(await this.EntityModel.exists(query));
    }
    return true; // If no EntityModel provided, assume valid or validation happens elsewhere
  }

  async rateEntity(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const userId = req.user._id;
      const ratings = req.body;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid Entity ID.', {
          status: 400,
          errorCode: 'INVALID_ENTITY_ID',
        });
      }

      // Validate required fields and values
      for (const field of this.ratingFields) {
        if (ratings[field] === undefined) {
          return sendError(res, `Missing rating field: ${field}`, {
            status: 400,
            errorCode: 'RATING_FIELD_MISSING',
          });
        }
        const val = Number(ratings[field]);
        if (Number.isNaN(val) || val < this.ratingRange.min || val > this.ratingRange.max) {
          return sendError(res, `Invalid value for ${field}. Must be ${this.ratingRange.min}-${this.ratingRange.max}.`, {
            status: 400,
            errorCode: 'RATING_VALUE_INVALID',
          });
        }
      }

      const exists = await this.validateEntity(normalizedId);
      if (!exists) {
        return sendError(res, 'Entity not found.', {
          status: 404,
          errorCode: 'ENTITY_NOT_FOUND',
        });
      }

      const query = { [this.entityIdField]: normalizedId, userId };
      
      // Prepare update payload
      const updatePayload = {
        [this.entityIdField]: normalizedId,
        userId,
        ...ratings,
        lastUpdated: new Date(), // Standardize
        dateUpdated: new Date()  // Support both naming conventions if needed
      };

      const ratingDoc = await this.RatingModel.findOneAndUpdate(
        query,
        {
          $set: updatePayload,
          $setOnInsert: { dateCreated: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      // Determine if it was an update or create (hacky check: createdAt approx equal to updatedAt means new)
      // Better: check if we found one before update, but findOneAndUpdate doesn't return that easily without extra query.
      // For history update, passing 'true' for existing is safe enough as the method handles pull/push.
      // Let's do a quick check to give correct message to user.
      // Actually, we can check created vs updated time diff, or just say 'submitted successfully' generic.
      // But let's try to be precise.
      const isNew = Math.abs(ratingDoc.dateCreated - ratingDoc.lastUpdated) < 1000; 

      if (this.updateStatsFn) {
        await this.updateStatsFn(normalizedId);
      }

      sendSuccess(res, ratingDoc, {
        message: isNew ? 'Rating submitted successfully.' : 'Rating updated successfully.',
      });

    } catch (err) {
      console.error('Error rating entity:', err);
      sendError(res, 'Failed to submit rating.', {
        status: 500,
        errorCode: 'RATING_SUBMIT_FAILED',
      });
    }
  }

  async getRatings(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const { includeUserDetails = false } = req.query;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid ID.', {
          status: 400,
          errorCode: 'INVALID_ID',
        });
      }

      const exists = await this.validateEntity(normalizedId);
      if (!exists) {
        return sendError(res, 'Entity not found.', {
          status: 404,
          errorCode: 'ENTITY_NOT_FOUND',
        });
      }

      let query = this.RatingModel.find({ [this.entityIdField]: normalizedId });

      if (includeUserDetails === 'true') {
        query = query.populate('userId', 'username profilePictureURL'); // Assumes ref is 'userId' in schema
      }

      const ratings = await query.sort({ dateCreated: -1 });

      sendSuccess(res, ratings, {
        extra: { count: ratings.length },
      });
    } catch (err) {
      console.error('Error fetching ratings:', err);
      sendError(res, 'Failed to fetch ratings.', {
        status: 500,
        errorCode: 'RATINGS_FETCH_FAILED',
      });
    }
  }

  async getUserRating(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const userId = req.user._id;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid ID.', {
          status: 400,
          errorCode: 'INVALID_ID',
        });
      }

      const rating = await this.RatingModel.findOne({
        [this.entityIdField]: normalizedId,
        userId,
      });

      sendSuccess(res, rating || null);
    } catch (err) {
      console.error('Error fetching user rating:', err);
      sendError(res, 'Failed to fetch user rating.', {
        status: 500,
        errorCode: 'USER_RATING_FETCH_FAILED',
      });
    }
  }
}

module.exports = RatingService;

