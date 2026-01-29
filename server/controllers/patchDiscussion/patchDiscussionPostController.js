const mongoose = require('mongoose');
const PatchDiscussionPost = require('../../models/PatchDiscussionPost');
const PatchDiscussionComment = require('../../models/PatchDiscussionComment');
const { sendSuccess, sendError } = require('../../utils/response');
const versionManager = require('../../utils/versionManager');

/**
 * Transform post for response
 */
const transformPostForResponse = (postObj, requestingUser) => {
  const isAuthor = requestingUser && postObj.userId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser && requestingUser.isAdministrator;

  return {
    id: postObj._id,
    title: postObj.title,
    body: postObj.body,
    userId: postObj.userId,
    user: postObj.user ? {
      username: postObj.user.username,
      profilePictureURL: postObj.user.profilePictureURL,
      rank: postObj.user.rank,
    } : {
      username: 'Deleted User',
      profilePictureURL: null,
      rank: null,
    },
    patchVersion: postObj.patchVersion,
    selectedChampion: postObj.selectedChampion || null,
    selectedGameMode: postObj.selectedGameMode || null,
    likedBy: postObj.likedBy || [],
    likeCount: postObj.likeCount || 0,
    viewCount: postObj.viewCount || 0,
    commentCount: postObj.commentCount || 0,
    isEdited: postObj.isEdited,
    status: postObj.status,
    createdAt: postObj.createdAt,
    updatedAt: postObj.updatedAt,
    capabilities: {
      canDelete: isAuthor || isAdmin,
      canEdit: isAuthor,
    },
  };
};

/**
 * Create a new patch discussion post
 */
exports.createPost = async (req, res) => {
  try {
    const { title, body, selectedChampion, selectedGameMode, patchVersion } = req.body;
    const userId = req.user._id;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return sendError(res, 'Title must be at least 5 characters.', {
        status: 400,
        errorCode: 'INVALID_TITLE',
      });
    }

    if (!body || typeof body !== 'string' || body.trim().length < 10) {
      return sendError(res, 'Body must be at least 10 characters.', {
        status: 400,
        errorCode: 'INVALID_BODY',
      });
    }

    // Use provided patch version or get latest
    let finalPatchVersion = patchVersion;
    if (!finalPatchVersion) {
      try {
        const latestVersion = await versionManager.getLatestVersion();
        // Extract major.minor (e.g., "14.23.1" -> "14.23")
        finalPatchVersion = latestVersion.split('.').slice(0, 2).join('.');
      } catch (error) {
        return sendError(res, 'Unable to determine patch version.', {
          status: 500,
          errorCode: 'PATCH_VERSION_ERROR',
        });
      }
    }

    // Moderation data from middleware
    const moderationData = {
      toxicityScore: req.body.toxicityScore || 0,
      spamScore: req.body.spamScore || 0,
      status: req.body.status || 'approved',
      autoModerationFailed: req.body.autoModerationFailed || false,
    };

    // Create post
    const post = await PatchDiscussionPost.create({
      title: title.trim(),
      body: body.trim(),
      userId,
      patchVersion: finalPatchVersion,
      selectedChampion: selectedChampion ? selectedChampion.trim() : null,
      selectedGameMode: selectedGameMode || null,
      ...moderationData,
    });

    // Populate user
    await post.populate({ path: 'user', select: 'username profilePictureURL rank' });

    const responseData = transformPostForResponse(
      post.toObject({ virtuals: true }),
      req.user
    );

    let message = 'Post created successfully.';
    if (post.status === 'rejected') message = 'Your post was rejected.';
    else if (post.status === 'needsReview') message = 'Your post is pending review.';

    sendSuccess(res, responseData, { message, status: 201 });
  } catch (err) {
    console.error('Error creating post:', err);
    sendError(res, 'Failed to create post.', { status: 500 });
  }
};

/**
 * Get posts with filtering and sorting
 */
exports.getPosts = async (req, res) => {
  try {
    const {
      patchVersion,
      champions, // single champion name
      gameMode, // single game mode
      sortBy = 'new', // 'new', 'hot', 'discussed'
      cursor,
      limit: limitParam = 20,
    } = req.query;

    console.log(req.query);
    const requestingUserId = req.user?._id;

    // Build filter query
    const filter = {
      isArchived: false,
    };

    // Visibility filter
    filter.$or = [
      { status: 'approved' },
      ...(requestingUserId ? [{ userId: requestingUserId }] : []),
    ];

    // Patch version filter
    if (patchVersion) {
      filter.patchVersion = patchVersion;
    } else {
      // Default to current patch
      try {
        const latestVersion = await versionManager.getLatestVersion();
        filter.patchVersion = latestVersion.split('.').slice(0, 2).join('.');
      } catch (error) {
        console.warn('Could not get latest version, showing all patches');
      }
    }

    // Champion filter (single champion)
    if (champions) {
      const championName = champions.trim();
      if (championName) {
        filter.selectedChampion = championName;
      }
    }

    // Game mode filter (single mode)
    if (gameMode) {
      const modeName = gameMode.trim();
      if (modeName) {
        filter.selectedGameMode = modeName;
      }
    }

    // Cursor pagination (for 'new' sort)
    if (cursor && sortBy === 'new') {
      const [createdAtStr, id] = cursor.split(':');
      const cursorDate = new Date(createdAtStr);

      if (id && !isNaN(cursorDate.getTime())) {
        filter.$and = [
          {
            $or: [
              { createdAt: { $lt: cursorDate } },
              { createdAt: cursorDate, _id: { $lt: id } },
            ],
          },
        ];
      }
    }

    const limit = Math.max(1, Math.min(Number(limitParam), 50));

    // Build query based on sort
    let query;
    let sort;

    if (sortBy === 'hot') {
      // For "hot" sorting, we need aggregation to sort by like count
      const pipeline = [
        { $match: filter },
        { $addFields: { likeCount: { $size: '$likedBy' } } },
        { $sort: { likeCount: -1, createdAt: -1 } },
        { $limit: limit + 1 },
      ];

      const posts = await PatchDiscussionPost.aggregate(pipeline);

      // Populate user data manually after aggregation
      await PatchDiscussionPost.populate(posts, {
        path: 'user',
        select: 'username profilePictureURL rank',
      });

      const items = posts.slice(0, limit).map(post =>
        transformPostForResponse(
          { ...post, _id: post._id, likeCount: post.likeCount },
          req.user
        )
      );

      const nextCursor = posts.length > limit ? `aggregation:${limit}` : null;

      return sendSuccess(res, items, {
        extra: {
          count: items.length,
          nextCursor,
          sortBy,
        },
      });
    } else if (sortBy === 'discussed') {
      // Sort by comment count
      sort = { commentCount: -1, createdAt: -1 };
    } else {
      // Default: 'new' - sort by creation date
      sort = { createdAt: -1, _id: -1 };
    }

    // Standard query for 'new' and 'discussed'
    query = PatchDiscussionPost.find(filter)
      .sort(sort)
      .limit(limit + 1)
      .populate({ path: 'user', select: 'username profilePictureURL rank' });

    const posts = await query;

    const items = posts.slice(0, limit).map(post =>
      transformPostForResponse(post.toObject({ virtuals: true }), req.user)
    );

    let nextCursor = null;
    if (posts.length > limit) {
      const lastItem = items[items.length - 1];
      nextCursor = `${new Date(lastItem.createdAt).toISOString()}:${lastItem.id}`;
    }

    sendSuccess(res, items, {
      extra: {
        count: items.length,
        nextCursor,
        sortBy,
      },
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    sendError(res, 'Failed to fetch posts.', { status: 500 });
  }
};

/**
 * Get a single post by ID
 */
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID.', { status: 400 });
    }

    const post = await PatchDiscussionPost.findById(postId)
      .populate({ path: 'user', select: 'username profilePictureURL rank' });

    if (!post) {
      return sendError(res, 'Post not found.', { status: 404 });
    }

    // Check visibility
    const requestingUserId = req.user?._id;
    if (post.status !== 'approved') {
      if (!requestingUserId || post.userId.toString() !== requestingUserId.toString()) {
        return sendError(res, 'Post not found.', { status: 404 });
      }
    }

    const responseData = transformPostForResponse(
      post.toObject({ virtuals: true }),
      req.user
    );

    sendSuccess(res, responseData);
  } catch (err) {
    console.error('Error fetching post:', err);
    sendError(res, 'Failed to fetch post.', { status: 500 });
  }
};

/**
 * Update a post (only by author)
 */
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, body, selectedChampion, selectedGameMode } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID.', { status: 400 });
    }

    const post = await PatchDiscussionPost.findById(postId);

    if (!post) {
      return sendError(res, 'Post not found.', { status: 404 });
    }

    // Only author can edit
    if (post.userId.toString() !== userId.toString()) {
      return sendError(res, 'Unauthorized. You can only edit your own posts.', {
        status: 403,
        errorCode: 'POST_EDIT_FORBIDDEN',
      });
    }

    // Update fields
    if (title) post.title = title.trim();
    if (body) post.body = body.trim();
    if (selectedChampion !== undefined) post.selectedChampion = selectedChampion ? selectedChampion.trim() : null;
    if (selectedGameMode !== undefined) post.selectedGameMode = selectedGameMode || null;

    post.isEdited = true;

    // Update moderation fields from middleware
    post.status = req.body.status || post.status;
    post.toxicityScore = req.body.toxicityScore || post.toxicityScore;
    post.spamScore = req.body.spamScore || post.spamScore;
    post.autoModerationFailed = req.body.autoModerationFailed || post.autoModerationFailed;

    await post.save();
    await post.populate({ path: 'user', select: 'username profilePictureURL rank' });

    const responseData = transformPostForResponse(
      post.toObject({ virtuals: true }),
      req.user
    );

    let message = 'Post updated successfully.';
    if (post.status === 'rejected') message = 'Your post was rejected.';
    else if (post.status === 'needsReview') message = 'Your post is pending review.';

    sendSuccess(res, responseData, { message });
  } catch (err) {
    console.error('Error updating post:', err);
    sendError(res, 'Failed to update post.', { status: 500 });
  }
};

/**
 * Delete a post (by author or admin)
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID.', { status: 400 });
    }

    const post = await PatchDiscussionPost.findById(postId);

    if (!post) {
      return sendError(res, 'Post not found.', { status: 404 });
    }

    // Check authorization
    const isAuthor = post.userId.toString() === userId.toString();
    const isAdmin = req.user && req.user.isAdministrator;

    if (!isAuthor && !isAdmin) {
      return sendError(res, 'Unauthorized. You can only delete your own posts.', {
        status: 403,
        errorCode: 'POST_DELETE_FORBIDDEN',
      });
    }

    // Delete all associated comments
    await PatchDiscussionComment.deleteMany({ postId });

    // Delete the post
    await PatchDiscussionPost.findByIdAndDelete(postId);

    sendSuccess(res, null, {
      message: 'Post and all associated comments deleted successfully.',
      extra: { deletedPostId: postId },
    });
  } catch (err) {
    console.error('Error deleting post:', err);
    sendError(res, 'Failed to delete post.', { status: 500 });
  }
};

/**
 * Like a post
 */
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID.', { status: 400 });
    }

    const post = await PatchDiscussionPost.findByIdAndUpdate(
      postId,
      { $addToSet: { likedBy: userId } },
      { new: true }
    );

    if (!post) {
      return sendError(res, 'Post not found.', { status: 404 });
    }

    sendSuccess(res, null, {
      extra: { likes: post.likedBy.length },
    });
  } catch (err) {
    console.error('Error liking post:', err);
    sendError(res, 'Failed to like post.', { status: 500 });
  }
};

/**
 * Unlike a post
 */
exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID.', { status: 400 });
    }

    const post = await PatchDiscussionPost.findByIdAndUpdate(
      postId,
      { $pull: { likedBy: userId } },
      { new: true }
    );

    if (!post) {
      return sendError(res, 'Post not found.', { status: 404 });
    }

    sendSuccess(res, null, {
      extra: { likes: post.likedBy.length },
    });
  } catch (err) {
    console.error('Error unliking post:', err);
    sendError(res, 'Failed to unlike post.', { status: 500 });
  }
};

/**
 * Increment view count
 */
exports.incrementView = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID.', { status: 400 });
    }

    const post = await PatchDiscussionPost.findByIdAndUpdate(
      postId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!post) {
      return sendError(res, 'Post not found.', { status: 404 });
    }

    sendSuccess(res, null, {
      extra: { views: post.viewCount },
    });
  } catch (err) {
    console.error('Error incrementing view:', err);
    sendError(res, 'Failed to increment view.', { status: 500 });
  }
};

/**
 * Get user's own posts
 */
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit: limitParam = 20 } = req.query;

    const limit = Math.max(1, Math.min(Number(limitParam), 50));

    const posts = await PatchDiscussionPost.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'username profilePictureURL rank' });

    const items = posts.map(post =>
      transformPostForResponse(post.toObject({ virtuals: true }), req.user)
    );

    sendSuccess(res, items, {
      extra: { count: items.length },
    });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    sendError(res, 'Failed to fetch user posts.', { status: 500 });
  }
};
