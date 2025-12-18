const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

class CommentService {
  /**
   * @param {Object} config
   * @param {Object} config.CommentModel - Mongoose Model for comments
   * @param {Object} [config.EntityModel] - Mongoose Model for entity validation (optional)
   * @param {String} config.entityIdField - Field name for entity ID (e.g. 'championId', 'skinId')
   * @param {Function} [config.validateEntityFn] - Custom validation function returning boolean
   * @param {Function} [config.updateStatsFn] - Function to update entity stats after comment
   * @param {String} [config.idType='String'] - Type of ID ('String' or 'Number')
   */
  constructor({
    CommentModel,
    EntityModel,
    entityIdField,
    validateEntityFn,
    updateStatsFn,
    idType = 'String'
  }) {
    this.CommentModel = CommentModel;
    this.EntityModel = EntityModel;
    this.entityIdField = entityIdField;
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

  async commentOnEntity(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const userId = req.user._id;
      const { comment } = req.body;

      if (!comment || typeof comment !== 'string') {
        return sendError(res, 'Comment text is required.', {
          status: 400,
          errorCode: 'COMMENT_REQUIRED',
        });
      }

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid Entity ID.', {
          status: 400,
          errorCode: 'INVALID_ENTITY_ID',
        });
      }

      const exists = await this.validateEntity(normalizedId);
      if (!exists) {
        return sendError(res, 'Entity not found.', {
          status: 404,
          errorCode: 'ENTITY_NOT_FOUND',
        });
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
        if (!user) {
          return sendError(res, 'User not found.', {
            status: 404,
            errorCode: 'USER_NOT_FOUND',
          });
        }

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

      let message;
      if (commentData.status === 'rejected') message = 'Your comment was rejected due to inappropriate content.';
      else if (commentData.status === 'needsReview') message = 'Your comment will be reviewed before being displayed.';
      else message = existingComment ? 'Comment updated successfully.' : 'Comment submitted successfully.';

      // Transform comment text for response
      const responseData = this.transformCommentForResponse(commentData.toObject ? commentData.toObject() : commentData);

      sendSuccess(res, responseData, {
        message,
        extra: {
          moderation: {
            status: commentData.status,
            toxicityScore: commentData.toxicityScore,
            spamScore: commentData.spamScore,
          },
        },
      });
    } catch (err) {
      console.error('Error commenting:', err);
      sendError(res, 'Failed to submit comment.', {
        status: 500,
        errorCode: 'COMMENT_SUBMIT_FAILED',
      });
    }
  }

  async getComments(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const {
        includeUserDetails = false,
        cursor,
        limit: limitParam,
        withCount = 'false',
      } = req.query;
      const requestingUserId = req.user?._id; // Get requesting user ID for filtering

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

      // Pagination setup
      const limit = Math.max(1, Math.min(Number(limitParam) || 20, 100));
      let cursorFilter = {};
      if (cursor) {
        // cursor format: `${createdAtISO}:${_id}`
        const [createdAtStr, id] = cursor.split(':');
        const createdAtDate = new Date(createdAtStr);
        if (!id || Number.isNaN(createdAtDate.getTime())) {
          return sendError(res, 'Invalid cursor.', {
            status: 400,
            errorCode: 'INVALID_CURSOR',
          });
        }
        cursorFilter = {
          $or: [
            { createdAt: { $lt: createdAtDate } },
            { createdAt: createdAtDate, _id: { $lt: id } },
          ],
        };
      }

      // Base query
      const baseQuery = {
        [this.entityIdField]: normalizedId,
        ...cursorFilter,
      };

      // Projection: only necessary fields
      const projection = {
        comment: 1,
        userId: 1,
        username: 1,
        likedBy: 1,
        status: 1,
        isEdited: 1,
        createdAt: 1,
        dateCreated: 1,
        replies: 1, // temporarily to compute replyCount, will drop from output
        toxicityScore: 1,
        spamScore: 1,
      };

      // Fetch limit+1 to detect nextCursor
      const docs = await this.CommentModel.find(baseQuery, projection)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1);

      // Compute total count only if requested
      let totalCount = undefined;
      if (withCount === 'true') {
        totalCount = await this.CommentModel.countDocuments({ [this.entityIdField]: normalizedId });
      }

      const items = docs
        .map((commentDoc) => {
          const commentObj = commentDoc.toObject({ virtuals: true });
          commentObj.replyCount = commentDoc.replies ? commentDoc.replies.length : 0;
          delete commentObj.replies; // Don't return full replies here
          return commentObj;
        })
        .filter((comment) => this.shouldShowComment(comment, requestingUserId))
        .map((comment) => this.transformCommentForResponse(comment));

      let processedItems = items;
      if (includeUserDetails === 'true') {
        processedItems = await this.CommentModel.populate(items, {
          path: 'user',
          select: 'username profilePictureURL',
        });
      }

      // Determine nextCursor
      let nextCursor = null;
      if (processedItems.length > limit) {
        const last = processedItems[limit - 1];
        nextCursor = `${new Date(last.createdAt).toISOString()}:${last._id}`;
        processedItems = processedItems.slice(0, limit);
      } else if (docs.length > limit) {
        // Safety: in case filtering reduced items, still use raw docs for cursor
        const lastDoc = docs[limit - 1];
        nextCursor = `${new Date(lastDoc.createdAt).toISOString()}:${lastDoc._id}`;
      }

      sendSuccess(res, processedItems, {
        extra: {
          count: processedItems.length,
          nextCursor,
          totalCount,
        },
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
      sendError(res, 'Failed to fetch comments.', {
        status: 500,
        errorCode: 'COMMENTS_FETCH_FAILED',
      });
    }
  }

  async getUserComment(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const userId = req.user._id;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid ID.', {
          status: 400,
          errorCode: 'INVALID_ID',
        });
      }

      const comment = await this.CommentModel.findOne({
        [this.entityIdField]: normalizedId,
        userId,
      });

      if (!comment) {
        return sendSuccess(res, null);
      }

      // Transform user's own comment (show rejection message if rejected)
      const transformed = this.transformCommentForResponse(comment.toObject());

      sendSuccess(res, transformed);
    } catch (err) {
      console.error('Error fetching user comment:', err);
      sendError(res, 'Failed to fetch user comment.', {
        status: 500,
        errorCode: 'USER_COMMENT_FETCH_FAILED',
      });
    }
  }

  async likeComment(req, res) {
    try {
      const userId = req.user._id;
      const { commentId } = req.params;

      // Use $addToSet for atomic operation (prevents duplicates even with race conditions)
      const comment = await this.CommentModel.findByIdAndUpdate(
        commentId,
        { $addToSet: { likedBy: userId } },  // Only adds if not already present
        { new: true }  // Return updated document
      );

      if (!comment) {
        return sendError(res, 'Comment not found.', {
          status: 404,
          errorCode: 'COMMENT_NOT_FOUND',
        });
      }

      sendSuccess(res, null, {
        extra: { likes: comment.likedBy.length },
      });
    } catch (err) {
      sendError(res, 'Failed to like comment.', {
        status: 500,
        errorCode: 'COMMENT_LIKE_FAILED',
      });
    }
  }

  async unlikeComment(req, res) {
    try {
      const userId = req.user._id;
      const { commentId } = req.params;

      // Use $pull for atomic operation (removes all instances)
      const comment = await this.CommentModel.findByIdAndUpdate(
        commentId,
        { $pull: { likedBy: userId } },  // Removes userId atomically
        { new: true }  // Return updated document
      );

      if (!comment) {
        return sendError(res, 'Comment not found.', {
          status: 404,
          errorCode: 'COMMENT_NOT_FOUND',
        });
      }

      sendSuccess(res, null, {
        extra: { likes: comment.likedBy.length },
      });
    } catch (err) {
      sendError(res, 'Failed to unlike comment.', {
        status: 500,
        errorCode: 'COMMENT_UNLIKE_FAILED',
      });
    }
  }

  async addReply(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const { commentId } = req.params;
      const userId = req.user._id;
      const { comment } = req.body;

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid ID.', {
          status: 400,
          errorCode: 'INVALID_ID',
        });
      }

      const parentComment = await this.CommentModel.findById(commentId);
      if (!parentComment) {
        return sendError(res, 'Parent comment not found.', {
          status: 404,
          errorCode: 'COMMENT_NOT_FOUND',
        });
      }

      if (parentComment[this.entityIdField] !== normalizedId) {
        return sendError(res, 'Comment does not belong to the specified entity.', {
          status: 400,
          errorCode: 'COMMENT_ENTITY_MISMATCH',
        });
      }

      const existingReply = parentComment.replies.find(r => r.userId.toString() === userId.toString());
      if (existingReply) {
        return sendError(res, 'You have already replied to this comment.', {
          status: 400,
          errorCode: 'REPLY_ALREADY_EXISTS',
        });
      }

      const user = await User.findById(userId).select('username');
      if (!user) {
        return sendError(res, 'User not found.', {
          status: 404,
          errorCode: 'USER_NOT_FOUND',
        });
      }

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

      sendSuccess(res, responseData, {
        message,
        extra: {
          moderation: {
            status: newReply.status,
            toxicityScore: newReply.toxicityScore,
            spamScore: newReply.spamScore,
          },
        },
      });
    } catch (err) {
      console.error('Error adding reply:', err);
      sendError(res, 'Failed to add reply.', {
        status: 500,
        errorCode: 'REPLY_ADD_FAILED',
      });
    }
  }

  async getReplies(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championId || req.params.skinId;
      const { commentId } = req.params;
      const { includeUserDetails = false } = req.query;
      const requestingUserId = req.user?._id; // Get requesting user ID for filtering

      const normalizedId = this.normalizeId(rawId);
      if (normalizedId === null) {
        return sendError(res, 'Invalid ID.', {
          status: 400,
          errorCode: 'INVALID_ID',
        });
      }

      const parentComment = await this.CommentModel.findById(commentId);
      if (!parentComment) {
        return sendError(res, 'Parent comment not found.', {
          status: 404,
          errorCode: 'COMMENT_NOT_FOUND',
        });
      }

      if (parentComment[this.entityIdField] !== normalizedId) {
        return sendError(res, 'Comment does not belong to the specified entity.', {
          status: 400,
          errorCode: 'COMMENT_ENTITY_MISMATCH',
        });
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

      sendSuccess(res, replies, {
        extra: { count: replies.length },
      });
    } catch (err) {
      console.error('Error fetching replies:', err);
      sendError(res, 'Failed to fetch replies.', {
        status: 500,
        errorCode: 'REPLIES_FETCH_FAILED',
      });
    }
  }

  async likeReply(req, res) {
    try {
      const userId = req.user._id;
      const { commentId, replyId } = req.params;

      // Use $addToSet with positional operator for nested document
      const comment = await this.CommentModel.findOneAndUpdate(
        { _id: commentId, 'replies._id': replyId },
        { $addToSet: { 'replies.$.likedBy': userId } },  // Only adds if not already present
        { new: true }
      );

      if (!comment) {
        return sendError(res, 'Comment or reply not found.', {
          status: 404,
          errorCode: 'COMMENT_OR_REPLY_NOT_FOUND',
        });
      }

      const reply = comment.replies.id(replyId);
      sendSuccess(res, null, {
        extra: { likes: reply.likedBy.length },
      });
    } catch (err) {
      sendError(res, 'Failed to like reply.', {
        status: 500,
        errorCode: 'REPLY_LIKE_FAILED',
      });
    }
  }

  async unlikeReply(req, res) {
    try {
      const userId = req.user._id;
      const { commentId, replyId } = req.params;

      // Use $pull with positional operator for nested document
      const comment = await this.CommentModel.findOneAndUpdate(
        { _id: commentId, 'replies._id': replyId },
        { $pull: { 'replies.$.likedBy': userId } },  // Removes userId atomically
        { new: true }
      );

      if (!comment) {
        return sendError(res, 'Comment or reply not found.', {
          status: 404,
          errorCode: 'COMMENT_OR_REPLY_NOT_FOUND',
        });
      }

      const reply = comment.replies.id(replyId);
      sendSuccess(res, null, {
        extra: { likes: reply.likedBy.length },
      });
    } catch (err) {
      sendError(res, 'Failed to unlike reply.', {
        status: 500,
        errorCode: 'REPLY_UNLIKE_FAILED',
      });
    }
  }

  /**
   * Delete a comment (only the comment author can delete)
   * Deletes the entire comment including all replies
   */
  async deleteComment(req, res) {
    try {
      const userId = req.user._id;
      const { commentId } = req.params;

      // Find the comment first to verify ownership
      const comment = await this.CommentModel.findById(commentId);
      
      if (!comment) {
        return sendError(res, 'Comment not found.', {
          status: 404,
          errorCode: 'COMMENT_NOT_FOUND',
        });
      }

      // Security: Only allow the comment author to delete their comment
      if (comment.userId.toString() !== userId.toString()) {
        return sendError(res, 'Unauthorized. You can only delete your own comments.', {
          status: 403,
          errorCode: 'COMMENT_DELETE_FORBIDDEN',
        });
      }

      // Store entityId for stats update
      const entityId = comment[this.entityIdField];

      // Delete the comment (and all its replies)
      await this.CommentModel.findByIdAndDelete(commentId);

      // Update entity stats if function provided
      if (this.updateStatsFn) {
        await this.updateStatsFn(entityId);
      }

      sendSuccess(res, null, {
        message: 'Comment deleted successfully.',
        extra: { deletedCommentId: commentId },
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      sendError(res, 'Failed to delete comment.', {
        status: 500,
        errorCode: 'COMMENT_DELETE_FAILED',
      });
    }
  }

  /**
   * Delete a reply (only the reply author can delete)
   * Removes the reply from the parent comment's replies array
   */
  async deleteReply(req, res) {
    try {
      const userId = req.user._id;
      const { commentId, replyId } = req.params;

      // Find the parent comment
      const comment = await this.CommentModel.findById(commentId);
      
      if (!comment) {
        return sendError(res, 'Parent comment not found.', {
          status: 404,
          errorCode: 'COMMENT_NOT_FOUND',
        });
      }

      // Find the specific reply
      const reply = comment.replies.id(replyId);
      
      if (!reply) {
        return sendError(res, 'Reply not found.', {
          status: 404,
          errorCode: 'REPLY_NOT_FOUND',
        });
      }

      // Security: Only allow the reply author to delete their reply
      if (reply.userId.toString() !== userId.toString()) {
        return sendError(res, 'Unauthorized. You can only delete your own replies.', {
          status: 403,
          errorCode: 'REPLY_DELETE_FORBIDDEN',
        });
      }

      // Remove the reply using Mongoose subdocument method
      reply.deleteOne();
      await comment.save();

      sendSuccess(res, null, {
        message: 'Reply deleted successfully.',
        extra: { deletedReplyId: replyId, parentCommentId: commentId },
      });
    } catch (err) {
      console.error('Error deleting reply:', err);
      sendError(res, 'Failed to delete reply.', {
        status: 500,
        errorCode: 'REPLY_DELETE_FAILED',
      });
    }
  }
}

module.exports = CommentService;
