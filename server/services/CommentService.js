const User = require('../models/User');

class CommentService {
  /**
   * @param {Object} config
   * @param {Object} config.CommentModel - Mongoose Model for comments
   * @param {Object} [config.EntityModel] - Mongoose Model for entity validation (optional)
   * @param {String} config.entityIdField - Field name for entity ID (e.g. 'championId', 'skinId')
   * @param {String} config.userHistoryField - Field name in User model for history (e.g. 'recentChampionComments')
   * @param {Function} [config.validateEntityFn] - Custom validation function returning boolean
   * @param {Function} [config.updateStatsFn] - Function to update entity stats after comment
   * @param {String} [config.idType='String'] - Type of ID ('String' or 'Number')
   */
  constructor({
    CommentModel,
    EntityModel,
    entityIdField,
    userHistoryField,
    validateEntityFn,
    updateStatsFn,
    idType = 'String'
  }) {
    this.CommentModel = CommentModel;
    this.EntityModel = EntityModel;
    this.entityIdField = entityIdField;
    this.userHistoryField = userHistoryField;
    this.validateEntityFn = validateEntityFn;
    this.updateStatsFn = updateStatsFn;
    this.idType = idType;
  }

  normalizeId(id) {
    if (this.idType === 'Number') {
      const num = Number(id);
      return isNaN(num) ? null : num;
    }
    return String(id).trim() || null;
  }

  /**
   * Transform comment text based on moderation status
   * Only transforms rejected/needsReview comments to show placeholder text
   * @param {Object} comment - Comment object to transform
   * @returns {Object} Transformed comment
   */
  transformCommentForResponse(comment) {
    const transformed = { ...comment };

    // Replace comment text for moderated content
    if (transformed.status === 'rejected') {
      transformed.comment = "This comment was rejected due to inappropriate content. Please revise and try again.";
    } else if (transformed.status === 'needsReview') {
      transformed.comment = "This comment is under review";
    }

    // Remove sensitive moderation data from response
    delete transformed.toxicityScore;
    delete transformed.spamScore;

    return transformed;
  }

  /**
   * Check if a comment should be visible to the requesting user
   * @param {Object} comment - Comment to check
   * @param {String} requestingUserId - ID of user making the request
   * @returns {Boolean} True if comment should be shown
   */
  shouldShowComment(comment, requestingUserId) {
    // Always show approved comments
    if (comment.status === 'approved') return true;

    // Show rejected/needsReview comments only to their authors
    if (requestingUserId && comment.userId.toString() === requestingUserId.toString()) {
      return true;
    }

    // Hide rejected/needsReview comments from everyone else
    return false;
  }

  async validateEntity(id) {
    if (this.validateEntityFn) {
      return this.validateEntityFn(id);
    }
    if (this.EntityModel) {
      const query = {};
      query[this.entityIdField] = id;
      return !!(await this.EntityModel.exists(query));
    }
    return true;
  }

  async updateUserHistory(userId, existingComment, commentData) {
    try {
      const historyEntry = {
        [this.entityIdField]: commentData[this.entityIdField],
        dateUpdated: new Date(),
        comment: commentData.comment,
      };

      // Always remove existing entry first to bring to top
      if (existingComment) {
        await User.updateOne({ _id: userId }, { $pull: { [this.userHistoryField]: { [this.entityIdField]: commentData[this.entityIdField] } } });
      } else {
        // Also pull to prevent duplicates if any data inconsistency exists
        await User.updateOne({ _id: userId }, { $pull: { [this.userHistoryField]: { [this.entityIdField]: commentData[this.entityIdField] } } });
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
      console.error('Error updating user comment history:', err);
    }
  }

  async commentOnEntity(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const userId = req.user._id;
      const { comment } = req.body;

      if (!comment || typeof comment !== 'string') {
        return res.status(400).json({ success: false, error: 'Comment text is required.' });
      }

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return res.status(400).json({ success: false, error: 'Invalid Entity ID.' });
      }

      const exists = await this.validateEntity(normalizedId);
      if (!exists) {
        return res.status(404).json({ success: false, error: 'Entity not found.' });
      }

      const query = { [this.entityIdField]: normalizedId, userId };
      const existingComment = await this.CommentModel.findOne(query);

      let commentData;
      if (existingComment) {
        existingComment.comment = comment.trim();
        existingComment.toxicityScore = req.body.toxicityScore || 0;
        existingComment.spamScore = req.body.spamScore || 0;
        existingComment.status = req.body.status || 'approved';
        existingComment.isEdited = true;
        await existingComment.save();
        commentData = existingComment;
      } else {
        const user = await User.findById(userId).select('username');
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        commentData = await this.CommentModel.create({
          [this.entityIdField]: normalizedId,
          userId,
          username: user.username,
          comment: comment.trim(),
          isEdited: false,
          toxicityScore: req.body.toxicityScore || 0,
          spamScore: req.body.spamScore || 0,
          status: req.body.status || 'approved',
        });
      }

      if (this.updateStatsFn) {
        await this.updateStatsFn(normalizedId);
      }

      await this.updateUserHistory(userId, !!existingComment, commentData);

      let message;
      if (commentData.status === 'rejected') message = 'Your comment was rejected due to inappropriate content.';
      else if (commentData.status === 'needsReview') message = 'Your comment will be reviewed before being displayed.';
      else message = existingComment ? 'Comment updated successfully.' : 'Comment submitted successfully.';

      // Transform comment text for response
      const responseData = this.transformCommentForResponse(commentData.toObject ? commentData.toObject() : commentData);

      res.json({
        success: true,
        message,
        data: responseData,
        moderation: {
          status: commentData.status,
          toxicityScore: commentData.toxicityScore,
          spamScore: commentData.spamScore,
        },
      });
    } catch (err) {
      console.error('Error commenting:', err);
      res.status(500).json({ success: false, error: 'Failed to submit comment.', message: err.message });
    }
  }

  async getComments(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const { includeUserDetails = false } = req.query;
      const requestingUserId = req.user?._id; // Get requesting user ID for filtering

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) return res.status(400).json({ success: false, error: 'Invalid ID.' });

      const exists = await this.validateEntity(normalizedId);
      if (!exists) return res.status(404).json({ success: false, error: 'Entity not found.' });

      const commentsWithReplies = await this.CommentModel.find({ [this.entityIdField]: normalizedId })
        .sort({ createdAt: -1, dateCreated: -1 });

      // Filter and transform comments based on user permissions
      const commentsWithCounts = commentsWithReplies
        .map((commentDoc) => {
          const commentObj = commentDoc.toObject({ virtuals: true });
          commentObj.replyCount = commentDoc.replies ? commentDoc.replies.length : 0;
          delete commentObj.replies; // Don't return full replies here
          return commentObj;
        })
        .filter(comment => this.shouldShowComment(comment, requestingUserId)) // SERVER-SIDE FILTERING
        .map(comment => this.transformCommentForResponse(comment)); // Transform text

      let processedComments = commentsWithCounts;
      if (includeUserDetails === 'true') {
        processedComments = await this.CommentModel.populate(commentsWithCounts, {
          path: 'user',
          select: 'username profilePictureURL',
        });
      }

      res.json({ success: true, count: processedComments.length, data: processedComments });
    } catch (err) {
      console.error('Error fetching comments:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch comments.', message: err.message });
    }
  }

  async getUserComment(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const userId = req.user._id;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) return res.status(400).json({ success: false, error: 'Invalid ID.' });

      const comment = await this.CommentModel.findOne({
        [this.entityIdField]: normalizedId,
        userId,
      });

      if (!comment) {
        return res.json({ success: true, data: null });
      }

      // Transform user's own comment (show rejection message if rejected)
      const transformed = this.transformCommentForResponse(comment.toObject());

      res.json({ success: true, data: transformed });
    } catch (err) {
      console.error('Error fetching user comment:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch user comment.', message: err.message });
    }
  }

  async likeComment(req, res) {
    try {
      const userId = req.user._id;
      const { commentId } = req.params;

      const comment = await this.CommentModel.findById(commentId);
      if (!comment) return res.status(404).json({ success: false, error: 'Comment not found.' });

      if (!comment.likedBy.includes(userId)) {
        comment.likedBy.push(userId);
        await comment.save();
      }

      res.json({ success: true, likes: comment.likedBy.length });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to like comment.', message: err.message });
    }
  }

  async unlikeComment(req, res) {
    try {
      const userId = req.user._id;
      const { commentId } = req.params;

      const comment = await this.CommentModel.findById(commentId);
      if (!comment) return res.status(404).json({ success: false, error: 'Comment not found.' });

      comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
      await comment.save();

      res.json({ success: true, likes: comment.likedBy.length });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to unlike comment.', message: err.message });
    }
  }

  async addReply(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const { commentId } = req.params;
      const userId = req.user._id;
      const { comment } = req.body;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) return res.status(400).json({ success: false, error: 'Invalid ID.' });

      const parentComment = await this.CommentModel.findById(commentId);
      if (!parentComment) return res.status(404).json({ success: false, error: 'Parent comment not found.' });

      if (parentComment[this.entityIdField] !== normalizedId) {
        return res.status(400).json({ success: false, error: 'Comment does not belong to the specified entity.' });
      }

      const existingReply = parentComment.replies.find(r => r.userId.toString() === userId.toString());
      if (existingReply) return res.status(400).json({ success: false, error: 'You have already replied to this comment.' });

      const user = await User.findById(userId).select('username');
      if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

      const newReply = {
        userId,
        username: user.username,
        comment: comment.trim(),
        isEdited: false,
        toxicityScore: req.body.toxicityScore || 0,
        spamScore: req.body.spamScore || 0,
        status: req.body.status || 'approved',
        likedBy: [],
      };

      parentComment.replies.push(newReply);
      await parentComment.save();

      // Retrieve the newly added reply (it will have an _id now)
      const addedReply = parentComment.replies[parentComment.replies.length - 1];

      let message;
      if (newReply.status === 'rejected') message = 'Your reply was rejected due to inappropriate content.';
      else if (newReply.status === 'needsReview') message = 'Your reply will be reviewed before being displayed.';
      else message = 'Reply added successfully.';

      const responseData = this.transformCommentForResponse(addedReply.toObject());

      res.json({
        success: true,
        message,
        data: responseData,
        moderation: {
          status: newReply.status,
          toxicityScore: newReply.toxicityScore,
          spamScore: newReply.spamScore,
        },
      });
    } catch (err) {
      console.error('Error adding reply:', err);
      res.status(500).json({ success: false, error: 'Failed to add reply.', message: err.message });
    }
  }

  async getReplies(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const { commentId } = req.params;
      const { includeUserDetails = false } = req.query;
      const requestingUserId = req.user?._id; // Get requesting user ID for filtering

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) return res.status(400).json({ success: false, error: 'Invalid ID.' });

      const parentComment = await this.CommentModel.findById(commentId);
      if (!parentComment) return res.status(404).json({ success: false, error: 'Parent comment not found.' });

      if (parentComment[this.entityIdField] !== normalizedId) {
        return res.status(400).json({ success: false, error: 'Comment does not belong to the specified entity.' });
      }

      // Convert replies to plain objects
      let replies = parentComment.replies.map(r => r.toObject ? r.toObject() : r);

      // SERVER-SIDE FILTERING: Only show approved replies or user's own rejected/needsReview replies
      replies = replies.filter(reply => this.shouldShowComment(reply, requestingUserId));

      if (includeUserDetails === 'true') {
        const userIds = [...new Set(replies.map(reply => reply.userId))];
        const users = await User.find({ _id: { $in: userIds } }).select('username profilePictureURL');
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        replies = replies.map(reply => ({
          ...reply,
          user: userMap.get(reply.userId.toString()) || null
        }));
      }

      // Transform comment text based on status
      replies = replies.map(reply => this.transformCommentForResponse(reply));

      res.json({ success: true, count: replies.length, data: replies });
    } catch (err) {
      console.error('Error fetching replies:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch replies.', message: err.message });
    }
  }

  async likeReply(req, res) {
    try {
      const userId = req.user._id;
      const { commentId, replyId } = req.params;

      const comment = await this.CommentModel.findById(commentId);
      if (!comment) return res.status(404).json({ success: false, error: 'Comment not found.' });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ success: false, error: 'Reply not found.' });

      if (!reply.likedBy.includes(userId)) {
        reply.likedBy.push(userId);
        await comment.save();
      }

      res.json({ success: true, likes: reply.likedBy.length });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to like reply.', message: err.message });
    }
  }

  async unlikeReply(req, res) {
    try {
      const userId = req.user._id;
      const { commentId, replyId } = req.params;

      const comment = await this.CommentModel.findById(commentId);
      if (!comment) return res.status(404).json({ success: false, error: 'Comment not found.' });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ success: false, error: 'Reply not found.' });

      reply.likedBy = reply.likedBy.filter(id => id.toString() !== userId.toString());
      await comment.save();

      res.json({ success: true, likes: reply.likedBy.length });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to unlike reply.', message: err.message });
    }
  }
}

module.exports = CommentService;
