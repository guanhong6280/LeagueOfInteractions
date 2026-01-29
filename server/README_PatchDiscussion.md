# Patch Discussion Feature - Backend API Documentation

## Overview

The Patch Discussion feature allows players to create posts discussing patches, game modes, and champions. Posts can be filtered by champions and game modes, and sorted by recency, popularity, or discussion activity.

## Database Models

### PatchDiscussionPost
- **Title & Body**: Post content
- **Patch Version**: Automatically set to current patch or manually specified
- **Filters**: Selected champion (single) and game modes (array)
- **Engagement**: Like system, view count, comment count
- **Moderation**: Full toxicity/spam detection support
- **Soft Delete**: Posts can be archived instead of deleted

### PatchDiscussionComment
- **Comments & Replies**: Nested comment system
- **Engagement**: Like system on comments and replies
- **Moderation**: Full toxicity/spam detection support

## API Endpoints

Base URL: `/api/patch-discussion`

### Post Endpoints

#### 1. Get Posts (with filtering and sorting)
```
GET /api/patch-discussion/posts
```

**Query Parameters:**
- `patchVersion` (optional): Filter by patch (e.g., "14.23"). Defaults to current patch.
- `champions` (optional): Single champion name (e.g., "Yasuo")
- `gameModes` (optional): Comma-separated modes (e.g., "Ranked Solo/Duo,ARAM")
- `sortBy` (optional): "new" (default), "hot" (most liked), "discussed" (most comments)
- `cursor` (optional): For pagination
- `limit` (optional): Number of posts (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "postId",
      "title": "Post title",
      "body": "Post content...",
      "user": {
        "username": "PlayerName",
        "profilePictureURL": "...",
        "rank": "Diamond"
      },
      "patchVersion": "14.23",
      "selectedChampion": "Yasuo",
      "gameModes": ["Ranked Solo/Duo"],
      "likeCount": 42,
      "viewCount": 150,
      "commentCount": 12,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "capabilities": {
        "canDelete": false,
        "canEdit": false
      }
    }
  ],
  "count": 20,
  "nextCursor": "...",
  "sortBy": "new"
}
```

#### 2. Get Single Post
```
GET /api/patch-discussion/posts/:postId
```

**Response:** Same as post object above

#### 3. Create Post (Authenticated)
```
POST /api/patch-discussion/posts
```

**Body:**
```json
{
  "title": "Post title (5-200 chars)",
  "body": "Post content (10-5000 chars)",
  "selectedChampion": "Yasuo", // Optional, single champion
  "gameModes": ["Ranked Solo/Duo", "ARAM"],
  "patchVersion": "14.23" // Optional, defaults to current patch
}
```

**Response:** Created post object

#### 4. Update Post (Authenticated, Author Only)
```
PUT /api/patch-discussion/posts/:postId
```

**Body:** Same as create, all fields optional

#### 5. Delete Post (Authenticated, Author or Admin)
```
DELETE /api/patch-discussion/posts/:postId
```

**Response:**
```json
{
  "success": true,
  "message": "Post and all associated comments deleted successfully.",
  "deletedPostId": "postId"
}
```

#### 6. Like Post (Authenticated)
```
POST /api/patch-discussion/posts/:postId/like
```

**Response:**
```json
{
  "success": true,
  "likes": 43
}
```

#### 7. Unlike Post (Authenticated)
```
POST /api/patch-discussion/posts/:postId/unlike
```

#### 8. Increment View Count
```
POST /api/patch-discussion/posts/:postId/view
```

#### 9. Get User's Own Posts (Authenticated)
```
GET /api/patch-discussion/posts/user/me
```

### Comment Endpoints

#### 1. Get Comments for Post
```
GET /api/patch-discussion/posts/:postId/comments
```

**Query Parameters:**
- `includeUserDetails` (optional): "true" (default) or "false"
- `cursor` (optional): For pagination
- `limit` (optional): Number of comments (default: 20, max: 100)

#### 2. Comment on Post (Authenticated)
```
POST /api/patch-discussion/posts/:postId/comments
```

**Body:**
```json
{
  "comment": "Comment text (1-2000 chars)"
}
```

#### 3. Get User's Comment for Post (Authenticated)
```
GET /api/patch-discussion/posts/:postId/comments/user
```

#### 4. Like/Unlike Comment (Authenticated)
```
POST /api/patch-discussion/posts/:postId/comments/:commentId/like
POST /api/patch-discussion/posts/:postId/comments/:commentId/unlike
```

#### 5. Delete Comment (Authenticated, Author or Admin)
```
DELETE /api/patch-discussion/posts/:postId/comments/:commentId
```

### Reply Endpoints

#### 1. Get Replies for Comment
```
GET /api/patch-discussion/posts/:postId/comments/:commentId/replies
```

#### 2. Add Reply (Authenticated)
```
POST /api/patch-discussion/posts/:postId/comments/:commentId/replies
```

**Body:**
```json
{
  "comment": "Reply text (1-1000 chars)"
}
```

#### 3. Like/Unlike Reply (Authenticated)
```
POST /api/patch-discussion/posts/:postId/comments/:commentId/replies/:replyId/like
POST /api/patch-discussion/posts/:postId/comments/:commentId/replies/:replyId/unlike
```

#### 4. Delete Reply (Authenticated, Author or Admin)
```
DELETE /api/patch-discussion/posts/:postId/comments/:commentId/replies/:replyId
```

## Game Mode Enums

Valid game modes for filtering:
- "Ranked Solo/Duo"
- "Ranked Flex"
- "Swift Play"
- "Draft Pick"
- "ARAM"
- "ARAM Mayhem"
- "Arena"
- "Ultimate Spellbook"
- "URF"

## Moderation

All posts and comments go through the same moderation pipeline as existing content:
- Toxicity detection via Perspective API
- Spam detection
- Automatic approval/rejection
- Manual moderation by admins

## Archiving Old Patches

To delete old patch content (e.g., to save storage):

```javascript
// Example: Delete all posts older than patch 14.20
await PatchDiscussionPost.deleteMany({ 
  patchVersion: { $lt: "14.20" } 
});

// Associated comments are automatically deleted when post is deleted
```

## Implementation Status

✅ Database schemas created
✅ Routes defined
✅ Controllers implemented
✅ Comment service integrated
✅ Moderation support
✅ Registered in server.js

## Next Steps

1. Test the API endpoints with Postman/Insomnia
2. Implement frontend UI components
3. Add admin tools for archiving old patches
4. Consider adding SSE (Server-Sent Events) for real-time updates
