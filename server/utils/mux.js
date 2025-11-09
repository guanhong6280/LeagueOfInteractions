const crypto = require('crypto');
const Video = require('../models/Video');

// Lazy require to avoid crash if env not set in some environments
let Mux;
try {
  Mux = require('@mux/mux-node');
} catch (e) {
  // Defer failure to runtime usage if module not installed
}

function getMuxClient() {
  if (!Mux) throw new Error('Mux SDK not installed. Please add @mux/mux-node');
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) throw new Error('Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET');
  const mux = new Mux({ tokenId, tokenSecret });
  return mux;
}

async function createDirectUpload(metadata = {}) {
  const mux = getMuxClient();
  const { uploads } = mux.video;
  const corsOrigin = metadata.corsOrigin || process.env.MUX_CORS_ORIGIN || null;
  console.log('Creating Direct Upload with CORS origin:', corsOrigin);
  const createRes = await uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policy: ['public'],
      passthrough: metadata.passthrough || undefined,
      meta: metadata.meta || undefined,
    },
  });
  return { uploadUrl: createRes.url, directUploadId: createRes.id };
}

function verifyWebhookSignature(req) {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing MUX_WEBHOOK_SECRET');
  const signatureHeader = req.headers['mux-signature'];
  if (!signatureHeader) throw new Error('Missing mux-signature header');
  const [tPart, v1Part] = signatureHeader.split(',');
  const timestamp = tPart?.split('=')[1];
  const signature = v1Part?.split('=')[1];
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString('utf8')
    : typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);
  const payload = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
    throw new Error('Invalid webhook signature');
  }
}

async function deleteAsset(assetId) {
  if (!assetId) return;
  const mux = getMuxClient();
  await mux.video.assets.delete(assetId);
}

module.exports = {
  createDirectUpload,
  verifyWebhookSignature,
  deleteAsset,
};


