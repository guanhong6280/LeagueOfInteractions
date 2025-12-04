const sseClientsByVideoId = new Map();

function writeSse(res, event, data) {
  try {
    if (event) res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (e) {
    // Ignore write errors from disconnected clients
  }
}

exports.addSseClient = (videoId, res) => {
  if (!sseClientsByVideoId.has(videoId)) sseClientsByVideoId.set(videoId, new Set());
  sseClientsByVideoId.get(videoId).add(res);
};

exports.removeSseClient = (videoId, res) => {
  const set = sseClientsByVideoId.get(videoId);
  if (set) {
    set.delete(res);
    if (set.size === 0) sseClientsByVideoId.delete(videoId);
  }
};

exports.broadcastToVideo = (videoId, event, payload) => {
  const set = sseClientsByVideoId.get(String(videoId));
  if (!set) return;
  for (const res of set) writeSse(res, event, payload);
};

exports.writeSse = writeSse;

