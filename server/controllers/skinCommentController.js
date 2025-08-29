const SkinComment = require('../models/SkinComment');
const Skin = require('../models/Skin');
const User = require('../models/User');
const { enqueueSummaryCheck } = require('../config/summaryQueue');
/**
 * Submit or update a comment for a specific skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.commentOnSkin = async (req, res) => {
  try {
    const { skinId } = req.params;
    const userId = req.user._id; // Middleware ensures user is authenticated
    const { comment } = req.body;

    // Validate skinId
    const numericSkinId = Number(skinId);
    if (isNaN(numericSkinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skin ID. Must be a valid number.',
      });
    }

    // Check if skin exists
    const skin = await Skin.findOne({ skinId: numericSkinId });
    if (!skin) {
      return res.status(404).json({
        success: false,
        error: 'Skin not found.',
      });
    }

    // Check if user already has a comment for this skin
    const existingComment = await SkinComment.findOne({
      skinId: numericSkinId,
      userId
    });

    let commentData;
    if (existingComment) {
      // Update existing comment
      existingComment.comment = comment.trim();
      existingComment.toxicityScore = req.body.toxicityScore || 0;
      existingComment.spamScore = req.body.spamScore || 0;
      existingComment.status = req.body.status || 'approved';
      existingComment.isEdited = true;
      await existingComment.save();
      commentData = existingComment;
    } else {
      // Get user's username
      const user = await User.findById(userId).select('username');
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found.',
        });
      }

      // Create new comment with moderation data
      commentData = await SkinComment.create({
        skinId: numericSkinId,
        userId,
        username: user.username,
        comment: comment.trim(),
        isEdited: false,
        toxicityScore: req.body.toxicityScore || 0,
        spamScore: req.body.spamScore || 0,
        status: req.body.status || 'approved',
      });
    }

    // Update skin's comment count
    await updateSkinCommentStats(numericSkinId);

    // Update user's recent comment history
    await updateUserRecentComments(userId, !!existingComment, commentData);

    // Enqueue summary check for new comments (Week 1 addition)
    if (!existingComment && commentData.status === 'approved') {
      await enqueueSummaryCheck(numericSkinId, 'NEW_COMMENT');
    }

    // Determine message based on status
    let message;
    if (commentData.status === 'rejected') {
      message = 'Your comment was rejected due to inappropriate content.';
    } else if (commentData.status === 'needsReview') {
      message = 'Your comment will be reviewed before being displayed.';
    } else {
      message = existingComment ? 'Comment updated successfully.' : 'Comment submitted successfully.';
    }

    res.json({
      success: true,
      message: message,
      data: commentData,
      moderation: {
        status: commentData.status,
        toxicityScore: commentData.toxicityScore,
        spamScore: commentData.spamScore
      }
    });

  } catch (err) {
    console.error('Error commenting on skin:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit comment.',
      message: err.message,
    });
  }
};

/**
 * Get all comments for a specific skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCommentsForSkin = async (req, res) => {
  try {
    const { skinId } = req.params;
    const { includeUserDetails = false } = req.query;

    // Validate skinId
    const numericSkinId = Number(skinId);
    if (isNaN(numericSkinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skin ID. Must be a valid number.',
      });
    }

    // Check if skin exists
    const skin = await Skin.findOne({ skinId: numericSkinId });
    if (!skin) {
      return res.status(404).json({
        success: false,
        error: 'Skin not found.',
      });
    }

    // Get comments with replies to calculate counts, then exclude replies content
    const commentsWithReplies = await SkinComment.find({ skinId: numericSkinId })
      .sort({ dateCreated: -1 });
    
    // Transform to include replyCount but exclude actual replies content
    const commentsWithCounts = commentsWithReplies.map(comment => {
      const commentObj = comment.toObject({ virtuals: true });
      // Keep replyCount but remove the actual replies array
      commentObj.replyCount = comment.replies ? comment.replies.length : 0;
      delete commentObj.replies;
      return commentObj;
    });
    
    // Populate user data if requested using Mongoose virtuals
    let processedComments = commentsWithCounts;
    if (includeUserDetails === 'true') {
      processedComments = await SkinComment.populate(commentsWithCounts, {
        path: 'user',
        select: 'username profilePictureURL'
      });
    }
    res.json({
      success: true,
      count: processedComments.length,
      data: processedComments,
    });

  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments.',
      message: err.message,
    });
  }
};

/**
 * Get a specific user's comment for a skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserCommentForSkin = async (req, res) => {
  try {
    const { skinId } = req.params;
    const userId = req.user._id; // Middleware ensures user is authenticated

    // Validate skinId
    const numericSkinId = Number(skinId);
    if (isNaN(numericSkinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skin ID. Must be a valid number.',
      });
    }

    const comment = await SkinComment.findOne({
      skinId: numericSkinId,
      userId
    });

    res.json({
      success: true,
      data: comment || null,
    });

  } catch (err) {
    console.error('Error fetching user comment:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user comment.',
      message: err.message,
    });
  }
};

/**
 * Helper function to update skin's aggregated comment statistics.
 * @param {Number} skinId - The skin ID
 */
async function updateSkinCommentStats(skinId) {
  try {
    const comments = await SkinComment.find({ skinId });

    await Skin.updateOne(
      { skinId },
      {
        $set: {
          totalNumberOfComments: comments.length,
        },
      }
    );
  } catch (err) {
    console.error('Error updating skin comment stats:', err);
  }
}

/**
 * Helper function to update user's recent comment history.
 * @param {ObjectId} userId - The user ID
 * @param {Boolean} existingComment - Whether this is an update to an existing comment
 * @param {Object} commentData - The comment data
 */
async function updateUserRecentComments(userId, existingComment, commentData) {
  try {
    // Extract only the fields we need for the history
    const { skinId, updatedAt, comment } = commentData;
    const historyEntry = { skinId, dateUpdated: updatedAt, comment };

    if (!existingComment) {
      // NEW comment: add to recent comments
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            recentSkinComments: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        }
      );
    } else {
      // EXISTING comment: update the entry in recent comments
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            recentSkinComments: { skinId: commentData.skinId },
          },
        }
      );

      // Then add the updated entry to the beginning
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            recentSkinComments: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        }
      );
    }
  } catch (err) {
    console.error('Error updating user comment history:', err);
  }
}

/**
 * Like a parent comment
 */
exports.likeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const comment = await SkinComment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    if (!comment.likedBy.includes(userId)) {
      comment.likedBy.push(userId);
      await comment.save();
    }
    res.json({ success: true, likes: comment.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to like comment', message: err.message });
  }
};

/**
 * Unlike a parent comment
 */
exports.unlikeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const comment = await SkinComment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
    await comment.save();
    res.json({ success: true, likes: comment.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to unlike comment', message: err.message });
  }
};

/**
 * Like a reply
 */
exports.likeReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId, replyId } = req.params;
    const comment = await SkinComment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ success: false, error: 'Reply not found' });
    if (!reply.likedBy.includes(userId)) {
      reply.likedBy.push(userId);
      await comment.save();
    }
    res.json({ success: true, likes: reply.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to like reply', message: err.message });
  }
};

/**
 * Unlike a reply
 */
exports.unlikeReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId, replyId } = req.params;
    const comment = await SkinComment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ success: false, error: 'Reply not found' });
    reply.likedBy = reply.likedBy.filter(id => id.toString() !== userId.toString());
    await comment.save();
    res.json({ success: true, likes: reply.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to unlike reply', message: err.message });
  }
};

/**
 * Add a reply to a specific comment
 */
exports.addReply = async (req, res) => {
  try {
    const { skinId, commentId } = req.params;
    const userId = req.user._id; // Middleware ensures user is authenticated
    const { comment } = req.body;

    // Check if parent comment exists
    const parentComment = await SkinComment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found.',
      });
    }

    // Verify the parent comment belongs to the specified skin
    if (parentComment.skinId !== Number(skinId)) {
      return res.status(400).json({
        success: false,
        error: 'Comment does not belong to the specified skin.',
      });
    }

    // Check if user already has a reply for this comment
    const existingReply = parentComment.replies.find(
      reply => reply.userId.toString() === userId.toString()
    );

    if (existingReply) {
      return res.status(400).json({
        success: false,
        error: 'You have already replied to this comment.',
      });
    }

    // Get user's username for performance
    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    // Add the reply to the parent comment with moderation data
    const newReply = {
      userId,
      username: user.username, // Keep for performance
      comment: comment.trim(),
      isEdited: false,
      toxicityScore: req.body.toxicityScore || 0,
      spamScore: req.body.spamScore || 0,
      status: req.body.status || 'approved',
      likedBy: []
    };

    parentComment.replies.push(newReply);
    await parentComment.save();

    if(!existingReply && newReply.status === 'approved'){
      await enqueueSummaryCheck(skinId, 'NEW_REPLY');
    }

    // Determine message based on status
    let message;
    if (newReply.status === 'rejected') {
      message = 'Your reply was rejected due to inappropriate content.';
    } else if (newReply.status === 'needsReview') {
      message = 'Your reply will be reviewed before being displayed.';
    } else {
      message = 'Reply added successfully.';
    }

    res.json({
      success: true,
      message: message,
      data: newReply,
      moderation: {
        status: newReply.status,
        toxicityScore: newReply.toxicityScore,
        spamScore: newReply.spamScore
      }
    });

  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add reply.',
      message: err.message,
    });
  }
};

/**
 * Get all replies for a specific comment
 */
exports.getRepliesForComment = async (req, res) => {
  try {
    const { skinId, commentId } = req.params;
    const { includeUserDetails = false } = req.query;

    // Check if parent comment exists
    const parentComment = await SkinComment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found.',
      });
    }

    // Verify the parent comment belongs to the specified skin
    if (parentComment.skinId !== Number(skinId)) {
      return res.status(400).json({
        success: false,
        error: 'Comment does not belong to the specified skin.',
      });
    }

    let replies = parentComment.replies;

    // Populate user details if requested using efficient batch loading
    if (includeUserDetails === 'true') {
      // Get unique user IDs to avoid duplicate queries
      const userIds = [...new Set(replies.map(reply => reply.userId))];
      
      // Batch load all users in a single query
      const users = await User.find({ _id: { $in: userIds } })
        .select('username profilePictureURL');
      
      // Create a map for fast lookups
      const userMap = new Map(users.map(user => [user._id.toString(), user]));
      
      // Transform replies with populated user data
      replies = replies.map(reply => ({
        ...reply.toObject(),
        user: userMap.get(reply.userId.toString()) || null
      }));
    }
    console.log('Replies:', replies);
    res.json({
      success: true,
      count: replies.length,
      data: replies,
    });

  } catch (err) {
    console.error('Error fetching replies:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch replies.',
      message: err.message,
    });
  }
}; 