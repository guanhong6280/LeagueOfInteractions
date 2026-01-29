import api from './apiClient';

// ========================================
// POST APIS
// ========================================

/**
 * Get all patch discussion posts with optional filtering and sorting
 * @param {Object} options - Query parameters
 * @param {string} options.patchVersion - Filter by patch version
 * @param {string} options.champion - Filter by champion name
 * @param {string} options.gameMode - Filter by game mode
 * @param {string} options.sortBy - Sort option: 'new', 'hot', 'discussed'
 * @param {number} options.limit - Number of posts per page
 * @param {string} options.cursor - Pagination cursor
 */
export const getPosts = async (options = {}) => {
  const params = {};
  if (options.patchVersion) params.patchVersion = options.patchVersion;
  if (options.champion) params.champions = options.champion; // Server expects 'champions' (plural)
  if (options.gameMode) params.gameMode = options.gameMode;
  if (options.sortBy) params.sortBy = options.sortBy;
  if (options.limit !== undefined) params.limit = options.limit;
  if (options.cursor) params.cursor = options.cursor;

  const response = await api.get('/api/patch-discussion/posts', { params });
  return response.data;
};

/**
 * Get a single post by ID
 * @param {string} postId - Post ID
 */
export const getPostById = async (postId) => {
  const response = await api.get(`/api/patch-discussion/posts/${postId}`);
  return response.data;
};

/**
 * Create a new patch discussion post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.body - Post content
 * @param {string} postData.patchVersion - Patch version
 * @param {string} postData.selectedChampion - Optional champion name
 * @param {string} postData.selectedGameMode - Optional game mode
 */
export const createPost = async (postData) => {
  const response = await api.post('/api/patch-discussion/posts', postData);
  return response.data;
};

/**
 * Update an existing post (author only)
 * @param {string} postId - Post ID
 * @param {Object} updateData - Updated post data
 */
export const updatePost = async (postId, updateData) => {
  const response = await api.put(`/api/patch-discussion/posts/${postId}`, updateData);
  return response.data;
};

/**
 * Delete a post (author or admin only)
 * @param {string} postId - Post ID
 */
export const deletePost = async (postId) => {
  const response = await api.delete(`/api/patch-discussion/posts/${postId}`);
  return response.data;
};

/**
 * Like a post
 * @param {string} postId - Post ID
 */
export const likePost = async (postId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/like`);
  return response.data;
};

/**
 * Unlike a post
 * @param {string} postId - Post ID
 */
export const unlikePost = async (postId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/unlike`);
  return response.data;
};

/**
 * Increment view count for a post
 * @param {string} postId - Post ID
 */
export const incrementPostView = async (postId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/view`);
  return response.data;
};

/**
 * Get current user's posts
 */
export const getUserPosts = async () => {
  const response = await api.get('/api/patch-discussion/posts/user/me');
  return response.data;
};

// ========================================
// COMMENT APIS
// ========================================

/**
 * Submit a comment on a post
 * @param {string} postId - Post ID
 * @param {Object} commentData - Comment data
 * @param {string} commentData.comment - Comment text
 */
export const submitPostComment = async (postId, commentData) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/comments`, commentData);
  return response.data;
};

/**
 * Get all comments for a post
 * @param {string} postId - Post ID
 * @param {Object} options - Query options
 * @param {boolean} options.includeUserDetails - Include user details
 * @param {number} options.limit - Number of comments
 * @param {string} options.cursor - Pagination cursor
 * @param {boolean} options.withCount - Include total count
 */
export const getPostComments = async (
  postId,
  { includeUserDetails = false, limit, cursor, withCount } = {}
) => {
  const params = { includeUserDetails };
  if (limit !== undefined) params.limit = limit;
  if (cursor) params.cursor = cursor;
  if (withCount !== undefined) params.withCount = withCount;

  const response = await api.get(`/api/patch-discussion/posts/${postId}/comments`, { params });
  return response.data;
};

/**
 * Get current user's comment for a post
 * @param {string} postId - Post ID
 */
export const getUserPostComment = async (postId) => {
  const response = await api.get(`/api/patch-discussion/posts/${postId}/comments/user`);
  return response.data;
};

/**
 * Like a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 */
export const likePostComment = async (postId, commentId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/comments/${commentId}/like`);
  return response.data;
};

/**
 * Unlike a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 */
export const unlikePostComment = async (postId, commentId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/comments/${commentId}/unlike`);
  return response.data;
};

/**
 * Delete a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 */
export const deletePostComment = async (postId, commentId) => {
  const response = await api.delete(`/api/patch-discussion/posts/${postId}/comments/${commentId}`);
  return response.data;
};

// ========================================
// REPLY APIS
// ========================================

/**
 * Add a reply to a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {Object} replyData - Reply data
 * @param {string} replyData.comment - Reply text
 */
export const addPostReply = async (postId, commentId, replyData) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/comments/${commentId}/replies`, replyData);
  return response.data;
};

/**
 * Get replies for a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {Object} options - Query options
 * @param {boolean} options.includeUserDetails - Include user details
 * @param {number} options.limit - Number of replies
 * @param {string} options.cursor - Pagination cursor
 * @param {boolean} options.withCount - Include total count
 */
export const getPostRepliesForComment = async (
  postId,
  commentId,
  { includeUserDetails = false, limit, cursor, withCount } = {}
) => {
  const params = { includeUserDetails };
  if (limit !== undefined) params.limit = limit;
  if (cursor) params.cursor = cursor;
  if (withCount !== undefined) params.withCount = withCount;

  const response = await api.get(`/api/patch-discussion/posts/${postId}/comments/${commentId}/replies`, { params });
  return response.data;
};

/**
 * Like a reply
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {string} replyId - Reply ID
 */
export const likePostReply = async (postId, commentId, replyId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/comments/${commentId}/replies/${replyId}/like`);
  return response.data;
};

/**
 * Unlike a reply
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {string} replyId - Reply ID
 */
export const unlikePostReply = async (postId, commentId, replyId) => {
  const response = await api.post(`/api/patch-discussion/posts/${postId}/comments/${commentId}/replies/${replyId}/unlike`);
  return response.data;
};

/**
 * Delete a reply
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {string} replyId - Reply ID
 */
export const deletePostReply = async (postId, commentId, replyId) => {
  const response = await api.delete(`/api/patch-discussion/posts/${postId}/comments/${commentId}/replies/${replyId}`);
  return response.data;
};
