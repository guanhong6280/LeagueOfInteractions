const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

class CommentService {
  /**
   * @param {Object} config
   * @param {Object} config.CommentModel - Mongoose Model for comments
   * @param {Object} [config.EntityModel] - Mongoose Model for entity validation (optional)
   * @param {String} config.entityIdField - Field name for entity ID (e.g. 'championName', 'skinId')
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
  // Backend: transformCommentForResponse
  transformCommentForResponse(commentObj, requestingUser) {
    // 1. Define the Business Rule HERE (Single Source of Truth)
    const isAuthor = requestingUser && commentObj.userId.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser && requestingUser.isAdministrator;
    // 2. Calculate Capabilities
    const canDelete = isAuthor || isAdmin;
    const canEdit = isAuthor; // Maybe only authors can edit text, not admins

    return {
      id: commentObj._id,
      comment: commentObj.comment,
      userId: commentObj.userId,
      user: commentObj.user ? {
        username: commentObj.user.username,
        profilePictureURL: commentObj.user.profilePictureURL,
      } : {
        username: 'Deleted User', // Fallback for deleted accounts
        profilePictureURL: null
      },

      createdAt: commentObj.createdAt,
      updatedAt: commentObj.updatedAt,
      status: commentObj.status,
      likedBy: commentObj.likedBy,
      isEdited: commentObj.isEdited,
      replyCount: commentObj.replyCount || 0,
      moderatedBy: commentObj.moderatedBy,
      // 3. Send the Capabilities to the Frontend
      capabilities: {
        canDelete: canDelete,
        canEdit: canEdit
      }
    };
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
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const userId = req.user._id;
      const { comment } = req.body;

      if (!comment || typeof comment !== 'string') {
        return sendError(res, 'Comment text is required.', { status: 400, errorCode: 'COMMENT_REQUIRED' });
      }

      const normalizedId = this.normalizeId(rawId);
      if (!normalizedId) return sendError(res, 'Invalid Entity ID.', { status: 400, errorCode: 'INVALID_ENTITY_ID' });

      const exists = await this.validateEntity(normalizedId);
      if (!exists) return sendError(res, 'Entity not found.', { status: 404, errorCode: 'ENTITY_NOT_FOUND' });

      // Check for existing comment
      const query = { [this.entityIdField]: normalizedId, userId };
      let commentDoc = await this.CommentModel.findOne(query);

      const moderationData = {
        toxicityScore: req.body.toxicityScore || 0,
        spamScore: req.body.spamScore || 0,
        status: req.body.status || 'approved',
        autoModerationFailed: req.body.autoModerationFailed || false,
      };

      if (commentDoc) {
        // Update existing
        commentDoc.comment = comment.trim();
        commentDoc.isEdited = true;

        // Update moderation fields on edit
        commentDoc.status = moderationData.status;
        commentDoc.toxicityScore = moderationData.toxicityScore;
        commentDoc.spamScore = moderationData.spamScore;
        commentDoc.autoModerationFailed = moderationData.autoModerationFailed;
        await commentDoc.save();
      } else {
        // Create new
        // NOTICE: We removed 'username: user.username' here!
        commentDoc = await this.CommentModel.create({
          [this.entityIdField]: normalizedId,
          userId,
          comment: comment.trim(),
          isEdited: false,
          ...moderationData,
        });
      }

      // Update stats hook
      if (this.updateStatsFn) await this.updateStatsFn(normalizedId);

      // CRITICAL: We must populate the user before returning, 
      // otherwise the frontend receives { user: null }
      await commentDoc.populate({ path: 'user', select: 'username profilePictureURL' });

      // Transform
      const responseData = this.transformCommentForResponse(
        commentDoc.toObject({ virtuals: true }),
        req.user
      );

      let message = 'Comment submitted successfully.';
      if (commentDoc.status === 'rejected') message = 'Your comment was rejected.';
      else if (commentDoc.status === 'needsReview') message = 'Your comment is pending review.';

      sendSuccess(res, responseData, { message });

    } catch (err) {
      console.error('Error commenting:', err);
      sendError(res, 'Failed to submit comment.', { status: 500 });
    }
  }

  /**
   * Fetches comments for a specific entity with cursor-based pagination.
   * Enforces visibility rules: Users see all approved comments, plus their own non-approved ones.
   */
  async getComments(req, res) {
    try {
      // 1. Parameter Extraction & Defaults
      // We use explicit defaults to avoid 'undefined' behavior
      const {
        includeUserDetails = 'true',
        cursor,
        limit: limitParam = 20,
        withCount = 'false',
      } = req.query;

      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const requestingUserId = req.user?._id;

      // 2. Validation (Fail Fast Principle)
      const normalizedId = this.normalizeId(rawId);
      if (!normalizedId) {
        return sendError(res, 'Invalid Entity ID provided.', {
          status: 400,
          errorCode: 'INVALID_ID'
        });
      }

      const exists = await this.validateEntity(normalizedId);
      if (!exists) {
        return sendError(res, 'Entity not found.', {
          status: 404,
          errorCode: 'ENTITY_NOT_FOUND'
        });
      }

      // 3. Construct the Security Filter (The "Engine Room")
      // This $or query ensures strict data isolation at the database level.
      const visibilityFilter = {
        $or: [
          { status: 'approved' },
          // Only add this condition if a user is actually logged in
          ...(requestingUserId ? [{ userId: requestingUserId }] : [])
        ]
      };

      const baseQuery = {
        [this.entityIdField]: normalizedId,
        ...visibilityFilter,
      };

      // 4. Cursor Logic (Pagination)
      if (cursor) {
        const [createdAtStr, id] = cursor.split(':');
        const cursorDate = new Date(createdAtStr);

        if (!id || isNaN(cursorDate.getTime())) {
          return sendError(res, 'Invalid cursor format.', { status: 400 });
        }

        // We use $and to ensure cursor logic doesn't override the visibility filter
        baseQuery.$and = [
          {
            $or: [
              { createdAt: { $lt: cursorDate } },
              { createdAt: cursorDate, _id: { $lt: id } },
            ],
          }
        ];
      }

      // Clamp limit to prevent abuse (e.g. asking for 1 million records)
      const limit = Math.max(1, Math.min(Number(limitParam), 100));

      // 5. Projection (Optimization)
      // Select only what we need. We DO NOT select 'username' here because 
      // we rely on the populated 'user' object for identity.
      const projection = {
        comment: 1,
        userId: 1,       // Required for ownership check
        status: 1,       // Required for UI badges (e.g. "Pending Review")
        createdAt: 1,
        replies: 1,      // Required for virtual replyCount
        likedBy: 1,
        isEdited: 1,
      };

      // 6. Execution
      // Fetch limit + 1 to proactively detect if there is a next page
      let query = this.CommentModel.find(baseQuery, projection)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1);

      if (includeUserDetails === 'true') {
        // Efficiently join user data
        query.populate({
          path: 'user',
          select: 'username profilePictureURL' // Security: Limit fields
        });
      }

      const docs = await query;

      // 7. Transformation Pipeline
      const items = docs.map((doc) => {
        // .toObject({ virtuals: true }) triggers the Virtual Populate & Getters
        const obj = doc.toObject({ virtuals: true });

        // Remove heavy internal data not needed by the client
        delete obj.replies;

        // Transform for API contract
        return this.transformCommentForResponse(obj, req.user);
      });

      // 8. Pagination Metadata
      let nextCursor = null;
      let responseItems = items;

      if (items.length > limit) {
        const lastItem = items[limit - 1];
        nextCursor = `${new Date(lastItem.createdAt).toISOString()}:${lastItem._id}`;
        // Remove the extra item we fetched
        responseItems = items.slice(0, limit);
      }

      // 9. Optional: Total Count (Expensive, so conditional)
      let totalCount;
      if (withCount === 'true') {
        // Must use same query to count only what user is ALLOWED to see
        totalCount = await this.CommentModel.countDocuments(baseQuery);
      }

      return sendSuccess(res, responseItems, {
        extra: {
          count: responseItems.length,
          nextCursor,
          totalCount,
        },
      });

    } catch (err) {
      console.error('[CommentController] getComments failed:', err);
      return sendError(res, 'Internal Server Error', {
        status: 500,
        errorCode: 'INTERNAL_ERROR'
      });
    }
  }

  async getUserComment(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const userId = req.user._id;

      const normalizedId = this.normalizeId(rawId);
      if (!normalizedId) return sendError(res, 'Invalid ID.', { status: 400, errorCode: 'INVALID_ID' });

      // FIX: Chain .populate() here so the Virtual 'user' is filled
      const comment = await this.CommentModel.findOne({
        [this.entityIdField]: normalizedId,
        userId,
      }).populate({
        path: 'user', 
        select: 'username profilePictureURL'
      });

      if (!comment) {
        return sendSuccess(res, null);
      }

      // Pass req.user for capability calculation
      const transformed = this.transformCommentForResponse(
        comment.toObject({ virtuals: true }), 
        req.user
      );

      sendSuccess(res, transformed);
    } catch (err) {
      console.error('Error fetching user comment:', err);
      sendError(res, 'Failed to fetch user comment.', { status: 500 });
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
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const { commentId } = req.params;
      const userId = req.user._id;
      const { comment } = req.body;

      const normalizedId = this.normalizeId(rawId);
      if (!normalizedId) return sendError(res, 'Invalid ID.', { status: 400, errorCode: 'INVALID_ID' });

      const parentComment = await this.CommentModel.findById(commentId);
      if (!parentComment) return sendError(res, 'Parent comment not found.', { status: 404 });

      // Integrity Check
      if (parentComment[this.entityIdField] !== normalizedId) {
        return sendError(res, 'Comment entity mismatch.', { status: 400, errorCode: 'COMMENT_ENTITY_MISMATCH' });
      }

      // Check Duplicates
      const existingReply = parentComment.replies.find(r => r.userId.toString() === userId.toString());
      if (existingReply) return sendError(res, 'You have already replied.', { status: 400 });

      // 1. Create Reply WITHOUT fetching User manually
      // We rely on the Virtual 'user' to link to the User collection later
      const newReply = {
        userId,
        comment: comment.trim(),
        isEdited: false,
        status: req.body.status || 'approved',
        toxicityScore: req.body.toxicityScore || 0,
        spamScore: req.body.spamScore || 0,
        likedBy: [],
      };

      parentComment.replies.push(newReply);
      await parentComment.save();

      // 2. Retrieve the new reply (last one in array)
      const addedReply = parentComment.replies[parentComment.replies.length - 1];

      // 3. Populate the 'user' virtual specifically for the replies
      // This fills 'replies.user' with data from the User collection
      await parentComment.populate({ 
        path: 'replies.user', 
        select: 'username profilePictureURL' 
      });

      // 4. Get the hydrated object
      const populatedReply = parentComment.replies.id(addedReply._id);

      let message = 'Reply added successfully.';
      if (newReply.status === 'rejected') message = 'Your reply was rejected.';
      else if (newReply.status === 'needsReview') message = 'Your reply is pending review.';

      const responseData = this.transformCommentForResponse(
        populatedReply.toObject({ virtuals: true }), 
        req.user
      );

      sendSuccess(res, responseData, {
        message,
        extra: {
          moderation: { status: newReply.status }
        },
      });
    } catch (err) {
      console.error('Error adding reply:', err);
      sendError(res, 'Failed to add reply.', { status: 500 });
    }
  }

async getReplies(req, res) {
    try {
      const rawId = req.params[this.entityIdField] || req.params.championName || req.params.skinId;
      const { commentId } = req.params;
      // Robust boolean check
      const { includeUserDetails = 'true' } = req.query; 
      const requestingUserId = req.user?._id;

      const normalizedId = this.normalizeId(rawId);
      if (!normalizedId) return sendError(res, 'Invalid ID.', { status: 400, errorCode: 'INVALID_ID' });

      // 1. Prepare Query
      const query = this.CommentModel.findById(commentId);

      // 2. Efficient Populate (The "Google Standard")
      if (String(includeUserDetails) === 'true') {
        query.populate({
          path: 'replies.user',
          select: 'username profilePictureURL'
        });
      }

      const parentComment = await query;
      if (!parentComment) return sendError(res, 'Comment not found.', { status: 404 });

      if (parentComment[this.entityIdField] !== normalizedId) {
        return sendError(res, 'Comment entity mismatch.', { status: 400 });
      }

      // 3. Filter & Transform
      // Since replies are a sub-array, we filter them in memory using standard array methods.
      // This replaces your manual User map logic entirely.
      const replies = parentComment.replies
        .map(r => r.toObject({ virtuals: true })) // Enable virtuals
        .filter(reply => this.shouldShowComment(reply, requestingUserId)) // Security Filter
        .map(reply => this.transformCommentForResponse(reply, req.user)); // UI Transformation

      sendSuccess(res, replies, {
        extra: { count: replies.length },
      });
    } catch (err) {
      console.error('Error fetching replies:', err);
      sendError(res, 'Failed to fetch replies.', { status: 500 });
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

      // Security: Only allow the comment author or admins to delete comments
      const isAuthor = comment.userId.toString() === userId.toString();
      const isAdmin = req.user && req.user.isAdministrator;
      
      if (!isAuthor && !isAdmin) {
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

      // Security: Only allow the reply author or admins to delete replies
      const isAuthor = reply.userId.toString() === userId.toString();
      const isAdmin = req.user && req.user.isAdministrator;
      
      if (!isAuthor && !isAdmin) {
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
