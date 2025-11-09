// server/controllers/videoController.js
const Video = require('../models/Video');
const { createDirectUpload, verifyWebhookSignature, deleteAsset, updateAssetMeta } = require('../utils/mux');
const { buildInteractionKey } = require('../utils/interaction');

// In-memory SSE clients registry: videoId -> Set(res)
const sseClientsByVideoId = new Map();

function writeSse(res, event, data) {
  try {
    if (event) res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (e) {
    // Ignore write errors from disconnected clients
  }
}

function addSseClient(videoId, res) {
  if (!sseClientsByVideoId.has(videoId)) sseClientsByVideoId.set(videoId, new Set());
  sseClientsByVideoId.get(videoId).add(res);
}

function removeSseClient(videoId, res) {
  const set = sseClientsByVideoId.get(videoId);
  if (set) {
    set.delete(res);
    if (set.size === 0) sseClientsByVideoId.delete(videoId);
  }
}

function broadcastToVideo(videoId, event, payload) {
  const set = sseClientsByVideoId.get(String(videoId));
  if (!set) return;
  for (const res of set) writeSse(res, event, payload);
}

exports.subscribeVideoEvents = async (req, res) => {
  const { id: videoId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  // Send an initial comment to establish stream
  res.write(': connected\n\n');

  addSseClient(String(videoId), res);

  // Send initial snapshot
  try {
    const doc = await Video.findById(videoId).lean();
    if (doc) {
      writeSse(res, 'snapshot', {
        _id: doc._id,
        status: doc.status,
        isApproved: doc.isApproved,
        provider: doc.provider,
        playbackUrl: doc.playbackUrl,
        title: doc.title,
        description: doc.description,
      });
    }
  } catch (e) {
    // If fetching snapshot fails, just continue the stream
  }

  // Heartbeats to keep proxies alive
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (e) { }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeSseClient(String(videoId), res);
    try { res.end(); } catch (e) { }
  });
};

exports.uploadVideo = async (req, res) => {
  try {
    let { champion1, ability1, champion2, ability2, videoURL } = req.body;
    const userId = req.user._id;

    // Check for required fields
    if (!champion1 || !ability1 || !champion2 || !ability2 || !videoURL) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert champion names to lowercase for consistency
    champion1 = champion1.toLowerCase();
    champion2 = champion2.toLowerCase();

    const interactionKey = buildInteractionKey({ champion1, ability1, champion2, ability2 });

    // Allow multiple submissions for same interaction; do not block on existence

    const title = `${champion1} ${ability1} VS ${champion2} ${ability2}`;
    const description = `The interaction between ${champion1} ${ability1} and ${champion2} ${ability2}`;

    const newVideo = new Video({
      champion1,
      ability1,
      champion2,
      ability2,
      interactionKey,
      videoURL,
      provider: 'youtube',
      status: 'ready',
      contributor: userId,
      title,
      description,
    });

    await newVideo.save();

    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Server error', error: error.message }); // Include error.message for more detail
  }
};


// server/controllers/videoController.js

exports.getVideoByInteraction = async (req, res) => {
  let { champion1, ability1, champion2, ability2 } = req.query;

  if (!champion1 || !ability1 || !champion2 || !ability2) {
    return res.status(400).json({ message: 'Missing query parameters' });
  }

  const interactionKey = buildInteractionKey({ champion1, ability1, champion2, ability2 });

  try {
    const query = { interactionKey, isApproved: true, status: 'ready' };
    const video = await Video.findOne(query).populate('contributor', 'username');

    if (video) {
      res.json(video);
    } else {
      res.status(404).json({ message: 'No video found for the selected interaction.' });
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Initialize a Mux direct upload and create a draft Video record
exports.initMuxUpload = async (req, res) => {
  try {
    let { champion1, ability1, champion2, ability2, title, description } = req.body;
    const userId = req.user._id;

    if (!champion1 || !ability1 || !champion2 || !ability2) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const interactionKey = buildInteractionKey({ champion1, ability1, champion2, ability2 });

    const origin = req.headers.origin;
    const muxUpload = await createDirectUpload({
      passthrough: interactionKey,
      corsOrigin: origin || 'http://localhost:5173',
      meta: {
        title: (title || `${champion1} ${ability1} VS ${champion2} ${ability2}`).slice(0, 512),
        creator_id: String(userId),
      },
    });

    const draft = new Video({
      champion1,
      ability1,
      champion2,
      ability2,
      interactionKey,
      provider: 'mux',
      status: 'uploading',
      directUploadId: muxUpload.directUploadId,
      contributor: userId,
      title: title || `${champion1} ${ability1} VS ${champion2} ${ability2}`,
      description: description || `The interaction between ${champion1} ${ability1} and ${champion2} ${ability2}`,
      isApproved: false,
    });
    await draft.save();

    res.status(201).json({ uploadUrl: muxUpload.uploadUrl, videoId: draft._id });
  } catch (error) {
    console.error('Error initializing Mux upload:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.muxWebhook = async (req, res) => {
  // 1) Verify against raw bytes
  try {
    verifyWebhookSignature(req);
  } catch (err) {
    console.error('Mux webhook signature verification failed:', err.message);
    return res.status(400).send('Invalid signature');
  }

  // 2) Parse the Buffer -> JSON
  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch (e) {
    console.error('Bad JSON from Mux:', e.message);
    return res.status(400).send('Bad JSON');
  }

  // 3) Now you can read event.type & event.data
  console.log('[MUX EVENT]', event.type, {
    uploadId: event?.data?.id,
    assetId: event?.data?.asset_id,
  });

  try {
    const { type, data } = event;

    if (type === 'video.upload.asset_created') {
      const directUploadId = data.id;
      const assetId = data.asset_id;
      const video = await Video.findOneAndUpdate(
        { directUploadId },
        { assetId, status: 'processing' },
        { new: true }
      );
      if (video) broadcastToVideo(video._id, 'processing', { status: 'processing', assetId }); 
      else console.warn('Direct upload not found for asset_created');
    }

    else if (type === 'video.asset.ready') {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;
      const playbackUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : undefined;

      const video = await Video.findOneAndUpdate(
        { assetId },
        { playbackId, playbackUrl, status: 'ready' },
        { new: true }
      );
      if (video) broadcastToVideo(video._id, 'ready', { status: 'ready', playbackUrl });
      else console.warn('Video not found for asset.ready');
    }

    else if (type === 'video.asset.errored') {
      const assetId = data.id;
      const video = await Video.findOneAndUpdate(
        { assetId },
        { status: 'failed' },
        { new: true }
      );
      if (video) broadcastToVideo(video._id, 'failed', { status: 'failed' });
    }

    return res.status(200).send('ok'); // ack fast
  } catch (e) {
    console.error('Error handling Mux webhook:', e);
    return res.status(500).send('Webhook handling error');
  }
};

// Admin: list pending videos (ready or processing, not approved)
exports.listPendingVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isApproved: false, status: { $in: ['processing', 'ready'] } })
      .populate('contributor', 'username email')
      .sort({ dateUploaded: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error listing pending videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Video.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Video not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error approving video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteRemote } = req.body || {};
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (deleteRemote && video.provider === 'mux' && video.assetId) {
      try { await deleteAsset(video.assetId); } catch (e) { console.error('Failed to delete Mux asset:', e.message); }
    }

    await video.deleteOne();
    broadcastToVideo(video._id, 'rejected', { deleted: true });
    res.json({ message: 'Video rejected and deleted' });
  } catch (error) {
    console.error('Error rejecting video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
