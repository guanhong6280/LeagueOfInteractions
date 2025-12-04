const User = require('../models/User');

class RatingService {
  /**
   * @param {Object} config
   * @param {Object} config.RatingModel - Mongoose Model for ratings
   * @param {Object} [config.EntityModel] - Mongoose Model for entity validation (optional)
   * @param {String} config.entityIdField - Field name for entity ID (e.g. 'championId', 'skinId')
   * @param {String} config.userHistoryField - Field name in User model for history
   * @param {Array<String>} config.ratingFields - Array of rating field names to validate/update
   * @param {Function} [config.updateStatsFn] - Function to update aggregated stats
   * @param {String} [config.idType='String'] - Type of ID ('String' or 'Number')
   * @param {Object} [config.ratingRange={min: 1, max: 10}] - Range for ratings
   */
  constructor({
    RatingModel,
    EntityModel,
    entityIdField,
    userHistoryField,
    ratingFields,
    updateStatsFn,
    idType = 'String',
    ratingRange = { min: 1, max: 10 }
  }) {
    this.RatingModel = RatingModel;
    this.EntityModel = EntityModel;
    this.entityIdField = entityIdField;
    this.userHistoryField = userHistoryField;
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

  async updateUserHistory(userId, existingRating, ratingDoc) {
    try {
      const historyEntry = {
        [this.entityIdField]: ratingDoc[this.entityIdField],
        dateUpdated: ratingDoc.lastUpdated || ratingDoc.dateUpdated || new Date(),
      };
      
      // Copy rating fields
      this.ratingFields.forEach(field => {
        historyEntry[field] = ratingDoc[field];
      });

      // Always remove existing entry first to bring to top
      if (existingRating) {
        await User.updateOne({ _id: userId }, { $pull: { [this.userHistoryField]: { [this.entityIdField]: ratingDoc[this.entityIdField] } } });
      } else {
         await User.updateOne({ _id: userId }, { $pull: { [this.userHistoryField]: { [this.entityIdField]: ratingDoc[this.entityIdField] } } });
      }

      await User.updateOne(
        { _id: userId },
        {
          $push: {
            [this.userHistoryField]: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        }
      );
    } catch (err) {
      console.error('Error updating user rating history:', err);
    }
  }

  async rateEntity(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const userId = req.user._id;
      const ratings = req.body;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return res.status(400).json({ success: false, error: 'Invalid Entity ID.' });
      }

      // Validate required fields and values
      for (const field of this.ratingFields) {
        if (ratings[field] === undefined) {
          return res.status(400).json({ success: false, error: `Missing rating field: ${field}` });
        }
        const val = Number(ratings[field]);
        if (Number.isNaN(val) || val < this.ratingRange.min || val > this.ratingRange.max) {
          return res.status(400).json({ success: false, error: `Invalid value for ${field}. Must be ${this.ratingRange.min}-${this.ratingRange.max}.` });
        }
      }

      const exists = await this.validateEntity(normalizedId);
      if (!exists) {
        return res.status(404).json({ success: false, error: 'Entity not found.' });
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

      await this.updateUserHistory(userId, !isNew, ratingDoc);

      res.json({
        success: true,
        message: isNew ? 'Rating submitted successfully.' : 'Rating updated successfully.',
        data: ratingDoc,
      });

    } catch (err) {
      console.error('Error rating entity:', err);
      res.status(500).json({ success: false, error: 'Failed to submit rating.', message: err.message });
    }
  }

  async getRatings(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const { includeUserDetails = false } = req.query;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) return res.status(400).json({ success: false, error: 'Invalid ID.' });

      const exists = await this.validateEntity(normalizedId);
      if (!exists) return res.status(404).json({ success: false, error: 'Entity not found.' });

      let query = this.RatingModel.find({ [this.entityIdField]: normalizedId });

      if (includeUserDetails === 'true') {
        query = query.populate('userId', 'username profilePictureURL'); // Assumes ref is 'userId' in schema
      }

      const ratings = await query.sort({ dateCreated: -1 });

      res.json({
        success: true,
        count: ratings.length,
        data: ratings,
      });
    } catch (err) {
      console.error('Error fetching ratings:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch ratings.', message: err.message });
    }
  }

  async getUserRating(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const userId = req.user._id;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) return res.status(400).json({ success: false, error: 'Invalid ID.' });

      const rating = await this.RatingModel.findOne({
        [this.entityIdField]: normalizedId,
        userId,
      });

      res.json({
        success: true,
        data: rating || null,
      });
    } catch (err) {
      console.error('Error fetching user rating:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch user rating.', message: err.message });
    }
  }
}

module.exports = RatingService;

