<!-- 4a9a8346-c030-4852-8c74-6c4e7075689c e2eecda4-efaa-41a6-a3e5-e47cbdf3cf37 -->
# Adopt Mux for video handling + admin moderation (backend first)

## Context from current code

- Frontend embeds YouTube via iframe based on `videoURL`:
```16:31:client/src/common/ViewInteractionPage/VideoDisplay.jsx
<CardMedia component="iframe" src={`https://www.youtube.com/embed/${new URL(videoData.videoURL).searchParams.get('v')}`} ... />
```

- `Video` model and endpoints exist for upload/fetch by interaction:
```5:20:server/models/Video.js
videoURL: { type: String, required: true }, isApproved: { type: Boolean, default: false },
```




```56:85:server/controllers/videoController.js

exports.getVideoByInteraction = async (req, res) => { /* returns a video */ }

```

## Goals

- Keep YouTube working for existing records.
- Add Mux as a first-class provider with direct browser uploads, automatic encoding, HLS playback, and webhooks.
- Introduce admin approval workflow: list pending videos, approve/reject, only approved shown publicly.

## Data model changes (`server/models/Video.js`)

- Add fields (non-breaking):
  - `provider: { type: String, enum: ['youtube','mux'], default: 'youtube' }`
  - `assetId: String` (Mux Asset ID)
  - `playbackId: String`
  - `playbackUrl: String` (e.g., `https://stream.mux.com/<playbackId>.m3u8`)
  - `status: { type: String, enum: ['uploading','processing','ready','failed'], default: 'uploading' }`
  - `directUploadId: String` (to correlate webhook)
  - keep `videoURL` for YouTube; optional when provider='mux'
- Index: keep interaction uniqueness; optionally add `{directUploadId:1}`.

## Backend: Mux integration

- New `server/utils/mux.js`:
  - Initialize Mux SDK from env: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`.
  - `createDirectUpload(metadata)` → returns `uploadUrl`, `directUploadId`.
  - `verifyWebhookSignature(req)` → boolean/throw.
  - `deleteAsset(assetId)` (used on reject if desired).
- Env: add keys to `server/config.env`; wire via `process.env`.

### New/updated routes (`server/routes/videoRoutes.js`)

- `POST /videos/upload/init` (auth required):
  - Body: `champion1, ability1, champion2, ability2, title?, description?`.
  - Creates draft `Video` doc with `provider='mux'`, `status='uploading'`, `isApproved=false`, stores interaction keys + `directUploadId`.
  - Calls `createDirectUpload` and returns `{ uploadUrl, videoId }`.
- `POST /videos/webhook/mux` (no auth; verify signature):
  - Handle events:
    - `video.upload.asset_created` → store `assetId`.
    - `video.asset.ready` → store `playbackId` and `playbackUrl`, set `status='ready'`.
    - Failures → `status='failed'`.
  - Lookup by `directUploadId` (preferred) or `assetId`.
- `GET /videos` (public):
  - Existing `getVideoByInteraction` updated to filter `isApproved=true` and `status='ready'` by default.
- Admin (auth + admin middleware):
  - `GET /admin/videos/pending` → list `{status in ['processing','ready'], isApproved=false}` with interaction metadata.
  - `POST /admin/videos/:id/approve` → sets `isApproved=true`.
  - `POST /admin/videos/:id/reject` → sets `isApproved=false`, optional `reason`; optional delete Mux asset.

### Controller changes (`server/controllers/videoController.js`)

- Add handlers for `uploadInit`, `muxWebhook`, `listPending`, `approveVideo`, `rejectVideo`.
- Update `getVideoByInteraction` to include `{ isApproved: true, status: 'ready' }` in query.
- Keep existing `uploadVideo` for YouTube URLs; mark with `provider='youtube'`.

## Frontend (later; for awareness)

- Player becomes provider-aware: if `provider==='youtube'` → iframe; if `provider==='mux'` → HLS via `<video>` + hls.js using `playbackUrl`.
- Admin UI to review pending uploads and approve/reject.
- Uploader uses `upload/init` to get `uploadUrl` and uploads file directly to Mux.

## Security & moderation

- Verify Mux webhooks using signature header and secret.
- Require auth and admin guard on moderation endpoints.
- Consider rate limiting `upload/init`.

## Rollout/migration

- No migration required; mixed YouTube + Mux supported.
- Existing `videoURL` remains for legacy entries.

## Acceptance criteria

- Direct browser upload to Mux works; webhook updates `status` to `ready` with `playbackUrl`.
- Public fetch by interaction returns only approved + ready videos.
- Admin can list, approve, reject videos.
- YouTube embeds continue to work.

### To-dos

- [ ] Choose hosting path: S3+CloudFront HLS vs Mux/Cloudflare
- [ ] Extend Video model with provider, playbackUrl, status, assetId fields
- [ ] Add provider-aware rendering to VideoDisplay component
- [ ] Update fetchVideoData to return provider, playbackUrl, status
- [ ] Add upload init endpoint returning S3 presigned URL
- [ ] Kickoff MediaConvert job and worker to mark asset ready
- [ ] Alternative: integrate Mux/Cloudflare create-asset + webhook
- [ ] Integrate hls.js for HLS playback with <video> element
- [ ] Show processing state and errors in video player
- [ ] Optional: CloudFront signed URLs/cookies for private HLS
- [ ] Support mixed YouTube + new provider; no data migration