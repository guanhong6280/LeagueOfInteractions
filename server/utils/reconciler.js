const Video = require('../models/Video');
const { getMuxClientSafe } = (() => {
  try {
    const Mux = require('@mux/mux-node');
    return () => new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });
  } catch (e) {
    return () => null;
  }
})();

function hoursAgoDate(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

async function reconcileOnce() {
  const mux = getMuxClientSafe();
  const now = new Date();

  // Clean very old uploading drafts
  const staleUploading = await Video.find({ status: 'uploading', updatedAt: { $lt: hoursAgoDate(6) } }).limit(50);
  for (const v of staleUploading) {
    if (mux && v.directUploadId) {
      try {
        const du = await mux.video.uploads.get(v.directUploadId);
        if (du?.asset_id && !v.assetId) {
          await Video.findByIdAndUpdate(v._id, { assetId: du.asset_id, status: 'processing' });
          continue;
        }
        if (du?.status === 'errored' || du?.status === 'cancelled' || du?.status === 'timed_out') {
          await Video.findByIdAndUpdate(v._id, { status: 'failed' });
          continue;
        }
        if (du?.status === 'waiting') {
          try { await mux.video.uploads.cancel(v.directUploadId); } catch {}
          await Video.findByIdAndUpdate(v._id, { status: 'failed' });
          continue;
        }
      } catch (e) {
        // If lookup fails, mark failed to prevent permanent uploading state
        await Video.findByIdAndUpdate(v._id, { status: 'failed' });
      }
    } else {
      await Video.findByIdAndUpdate(v._id, { status: 'failed' });
    }
  }

  // Reconcile processing assets
  if (mux) {
    const processing = await Video.find({ status: 'processing', assetId: { $ne: null }, updatedAt: { $lt: hoursAgoDate(12) } }).limit(50);
    for (const v of processing) {
      try {
        const asset = await mux.video.assets.get(v.assetId);
        if (asset?.status === 'ready') {
          const playbackId = asset.playback_ids?.[0]?.id;
          const playbackUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : undefined;
          await Video.findByIdAndUpdate(v._id, { status: 'ready', playbackId, playbackUrl });
        } else if (asset?.status === 'errored') {
          await Video.findByIdAndUpdate(v._id, { status: 'failed' });
        }
      } catch (e) {
        // Ignore per-asset errors
      }
    }
  }
}

function startReconciler() {
  // Run periodically
  const intervalMs = Number(process.env.VIDEO_RECONCILE_INTERVAL_MS || 15 * 60 * 1000);
  // Kick once on start after small delay
  setTimeout(() => { reconcileOnce().catch(() => {}); }, 10000);
  setInterval(() => { reconcileOnce().catch(() => {}); }, intervalMs);
}

module.exports = { startReconciler };


