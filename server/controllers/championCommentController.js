const ChampionComment = require('../models/ChampionComment');
const Skin = require('../models/Skin');
const User = require('../models/User');

async function ensureChampionExists(championId) {
  if (!championId || typeof championId !== 'string') {
    return false;
  }

  const normalizedId = championId.trim();
  if (!normalizedId) {
    return false;
  }

  const championSkin = await Skin.exists({ championId: normalizedId });
  return !!championSkin;
}

async function updateUserRecentChampionComments(userId, existingComment, commentData) {
  try {
    const { championId, updatedAt, comment } = commentData;
    const historyEntry = { championId, dateUpdated: updatedAt, comment };

    if (!existingComment) {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            recentChampionComments: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        },
      );
    } else {
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            recentChampionComments: { championId: commentData.championId },
          },
        },
      );

      await User.updateOne(
        { _id: userId },
        {
          $push: {
            recentChampionComments: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        },
      );
    }
  } catch (err) {
    console.error('Error updating user champion comment history:', err);
  }
}

exports.commentOnChampion = async (req, res) => {
  try {
    const { championId } = req.params;
    const userId = req.user._id;
    const { comment } = req.body;

    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required.',
      });
    }

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Champion ID is required.',
      });
    }

    const championExists = await ensureChampionExists(normalizedChampionId);
    if (!championExists) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found.',
      });
    }

    const existingComment = await ChampionComment.findOne({
      championId: normalizedChampionId,
      userId,
    });

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
        return res.status(404).json({
          success: false,
          error: 'User not found.',
        });
      }

      commentData = await ChampionComment.create({
        championId: normalizedChampionId,
        userId,
        username: user.username,
        comment: comment.trim(),
        isEdited: false,
        toxicityScore: req.body.toxicityScore || 0,
        spamScore: req.body.spamScore || 0,
        status: req.body.status || 'approved',
      });
    }

    await updateUserRecentChampionComments(userId, !!existingComment, commentData);

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
      message,
      data: commentData,
      moderation: {
        status: commentData.status,
        toxicityScore: commentData.toxicityScore,
        spamScore: commentData.spamScore,
      },
    });
  } catch (err) {
    console.error('Error commenting on champion:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit comment.',
      message: err.message,
    });
  }
};

exports.getCommentsForChampion = async (req, res) => {
  try {
    const { championId } = req.params;
    const { includeUserDetails = false } = req.query;

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Champion ID is required.',
      });
    }

    const championExists = await ensureChampionExists(normalizedChampionId);
    if (!championExists) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found.',
      });
    }

    const commentsWithReplies = await ChampionComment.find({ championId: normalizedChampionId })
      .sort({ createdAt: -1 });

    const commentsWithCounts = commentsWithReplies.map((commentDoc) => {
      const commentObj = commentDoc.toObject({ virtuals: true });
      commentObj.replyCount = commentDoc.replies ? commentDoc.replies.length : 0;
      delete commentObj.replies;
      return commentObj;
    });

    let processedComments = commentsWithCounts;
    if (includeUserDetails === 'true') {
      processedComments = await ChampionComment.populate(commentsWithCounts, {
        path: 'user',
        select: 'username profilePictureURL',
      });
    }

    res.json({
      success: true,
      count: processedComments.length,
      data: processedComments,
    });
  } catch (err) {
    console.error('Error fetching champion comments:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments.',
      message: err.message,
    });
  }
};

exports.getUserCommentForChampion = async (req, res) => {
  try {
    const { championId } = req.params;
    const userId = req.user._id;

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Champion ID is required.',
      });
    }

    const comment = await ChampionComment.findOne({
      championId: normalizedChampionId,
      userId,
    });

    res.json({
      success: true,
      data: comment || null,
    });
  } catch (err) {
    console.error('Error fetching user champion comment:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user comment.',
      message: err.message,
    });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await ChampionComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (!comment.likedBy.includes(userId)) {
      comment.likedBy.push(userId);
      await comment.save();
    }

    res.json({ success: true, likes: comment.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to like comment.', message: err.message });
  }
};

exports.unlikeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await ChampionComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
    await comment.save();

    res.json({ success: true, likes: comment.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to unlike comment.', message: err.message });
  }
};

exports.likeReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId, replyId } = req.params;

    const comment = await ChampionComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found.' });
    }

    if (!reply.likedBy.includes(userId)) {
      reply.likedBy.push(userId);
      await comment.save();
    }

    res.json({ success: true, likes: reply.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to like reply.', message: err.message });
  }
};

exports.unlikeReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId, replyId } = req.params;

    const comment = await ChampionComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found.' });
    }

    reply.likedBy = reply.likedBy.filter((id) => id.toString() !== userId.toString());
    await comment.save();

    res.json({ success: true, likes: reply.likedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to unlike reply.', message: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { championId, commentId } = req.params;
    const userId = req.user._id;
    const { comment } = req.body;

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Champion ID is required.',
      });
    }

    const parentComment = await ChampionComment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found.',
      });
    }

    if (parentComment.championId !== normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Comment does not belong to the specified champion.',
      });
    }

    const existingReply = parentComment.replies.find(
      (reply) => reply.userId.toString() === userId.toString(),
    );

    if (existingReply) {
      return res.status(400).json({
        success: false,
        error: 'You have already replied to this comment.',
      });
    }

    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
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
      message,
      data: newReply,
      moderation: {
        status: newReply.status,
        toxicityScore: newReply.toxicityScore,
        spamScore: newReply.spamScore,
      },
    });
  } catch (err) {
    console.error('Error adding champion reply:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add reply.',
      message: err.message,
    });
  }
};

exports.getRepliesForComment = async (req, res) => {
  try {
    const { championId, commentId } = req.params;
    const { includeUserDetails = false } = req.query;

    const normalizedChampionId = championId?.trim();
    if (!normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Champion ID is required.',
      });
    }

    const parentComment = await ChampionComment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found.',
      });
    }

    if (parentComment.championId !== normalizedChampionId) {
      return res.status(400).json({
        success: false,
        error: 'Comment does not belong to the specified champion.',
      });
    }

    let replies = parentComment.replies;

    if (includeUserDetails === 'true') {
      const userIds = [...new Set(replies.map((reply) => reply.userId))];
      const users = await User.find({ _id: { $in: userIds } })
        .select('username profilePictureURL');
      const userMap = new Map(users.map((userDoc) => [userDoc._id.toString(), userDoc]));

      replies = replies.map((reply) => ({
        ...reply.toObject(),
        user: userMap.get(reply.userId.toString()) || null,
      }));
    }

    res.json({
      success: true,
      count: replies.length,
      data: replies,
    });
  } catch (err) {
    console.error('Error fetching champion replies:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch replies.',
      message: err.message,
    });
  }
};

