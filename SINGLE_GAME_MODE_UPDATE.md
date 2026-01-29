# Single Game Mode Selection - Update Summary

## Change Overview

Updated the patch discussion feature to allow **single game mode selection** instead of multiple game modes, simplifying the UX and aligning with the single champion approach.

## Files Updated

### Frontend (4 files)

#### 1. **CreatePostDialog.jsx** ✅
**Changes:**
- `gameModes: []` → `selectedGameMode: ''`
- `toggleGameMode()` → `selectGameMode()` (toggle behavior)
- Multi-select chips → Single-select chips
- Label updated to "Game Mode (Optional - Select One)"

**Before:**
```javascript
gameModes: ['ARAM', 'Ranked Solo/Duo']
```

**After:**
```javascript
selectedGameMode: 'ARAM'
```

#### 2. **DiscussionCard.jsx** ✅
**Changes:**
- Props: `gameModes: []` → `selectedGameMode: null`
- Display logic simplified - shows single badge instead of array
- Removed "+X MORE" badge logic

**Before:**
```jsx
{gameModes.slice(0, 2).map((mode) => (
  <NeoBadge key={mode} label={mode} color="#80D8FF" />
))}
```

**After:**
```jsx
{selectedGameMode && (
  <NeoBadge label={selectedGameMode} color="#80D8FF" />
)}
```

#### 3. **PatchDiscussion.jsx** ✅
**Changes:**
- State: `selectedModes: []` → `selectedMode: ''`
- Filter chips now toggle single selection
- Updated mock data
- Label: "GAME MODES:" → "GAME MODE: (Select one)"

#### 4. **PatchDiscussionDetail.jsx** ✅
**Changes:**
- Mock data: `gameModes: []` → `selectedGameMode: 'ARAM'`
- Badge display updated to single badge

### Backend (2 files)

#### 5. **PatchDiscussionPost.js (Model)** ✅
**Changes:**
```javascript
// BEFORE
gameModes: [{
  type: String,
  enum: [...],
  index: true,
}]

// AFTER
selectedGameMode: {
  type: String,
  enum: [...],
  required: false,
  index: true,
}
```

**Index updated:**
- `{ gameModes: 1, patchVersion: 1 }` → `{ selectedGameMode: 1, patchVersion: 1 }`

#### 6. **patchDiscussionPostController.js** ✅
**Changes:**

**transformPostForResponse():**
```javascript
// BEFORE
gameModes: postObj.gameModes || []

// AFTER
selectedGameMode: postObj.selectedGameMode || null
```

**createPost():**
```javascript
// BEFORE
const { title, body, selectedChampion, gameModes, patchVersion } = req.body;
gameModes: Array.isArray(gameModes) ? gameModes : []

// AFTER
const { title, body, selectedChampion, selectedGameMode, patchVersion } = req.body;
selectedGameMode: selectedGameMode || null
```

**getPosts() - Query params:**
```javascript
// BEFORE
gameModes, // comma-separated
filter.gameModes = { $in: gameModeList };

// AFTER
gameMode, // single game mode
filter.selectedGameMode = modeName;
```

**updatePost():**
```javascript
// BEFORE
const { title, body, selectedChampion, gameModes } = req.body;
if (Array.isArray(gameModes)) post.gameModes = gameModes;

// AFTER
const { title, body, selectedChampion, selectedGameMode } = req.body;
if (selectedGameMode !== undefined) post.selectedGameMode = selectedGameMode || null;
```

## API Changes

### Request Body (POST/PUT)
**Before:**
```json
{
  "title": "Post title",
  "selectedChampion": "Yasuo",
  "gameModes": ["ARAM", "Ranked Solo/Duo"]
}
```

**After:**
```json
{
  "title": "Post title",
  "selectedChampion": "Yasuo",
  "selectedGameMode": "ARAM"
}
```

### Query Parameters (GET)
**Before:**
```
GET /api/patch-discussion/posts?gameModes=ARAM,Ranked Solo/Duo
```

**After:**
```
GET /api/patch-discussion/posts?gameMode=ARAM
```

### Response Data
**Before:**
```json
{
  "id": "123",
  "selectedChampion": "Yasuo",
  "gameModes": ["ARAM", "Ranked Solo/Duo"]
}
```

**After:**
```json
{
  "id": "123",
  "selectedChampion": "Yasuo",
  "selectedGameMode": "ARAM"
}
```

## Database Schema

### Old Schema
```javascript
{
  selectedChampion: String,
  gameModes: [String]
}
```

### New Schema
```javascript
{
  selectedChampion: String,
  selectedGameMode: String
}
```

## UI/UX Changes

### Create Post Dialog
- ✅ Chips now highlight one at a time
- ✅ Clicking same chip deselects it
- ✅ Clear label: "Game Mode (Optional - Select One)"

### Post Card Display
- ✅ Shows single game mode badge
- ✅ Cleaner, less cluttered

### Filter Panel
- ✅ Single-select behavior
- ✅ Label: "GAME MODE: (Select one)"

## Benefits

1. **Simpler UX** - One mode = clearer discussion focus
2. **Consistent with Champion** - Both filters are single-select
3. **Cleaner Data Model** - String instead of array
4. **Easier Filtering** - Direct match instead of `$in` operator
5. **Better Performance** - Simpler queries, better indexes

## Testing Checklist

- [ ] Create post with game mode
- [ ] Create post without game mode
- [ ] Toggle game mode selection (deselect by clicking again)
- [ ] Filter posts by game mode
- [ ] Update post game mode
- [ ] Display single game mode badge on card
- [ ] Display single game mode badge on detail page
- [ ] Verify database indexes

## Migration Notes

If you have existing posts with `gameModes` array:

```javascript
// Convert array to single value (take first element)
await PatchDiscussionPost.updateMany(
  { gameModes: { $exists: true, $ne: [] } },
  [{
    $set: {
      selectedGameMode: { $arrayElemAt: ["$gameModes", 0] }
    },
    $unset: "gameModes"
  }]
);
```

## Status

✅ All files updated
✅ No linter errors
✅ Frontend and backend aligned
✅ Ready for testing

## Summary

Both champion and game mode are now **single-select**, creating a consistent, simplified user experience where each post focuses on:
- **One champion** (optional)
- **One game mode** (optional)
- **One patch version** (required)

This makes discussions more focused and filtering more intuitive! 🎯
