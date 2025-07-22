// server/models/Video.js
const mongoose = require('mongoose');

// I will probably just grab the views and likes and comment counts from youtube? can i do that?
const VideoSchema = new mongoose.Schema({
  champion1: { type: String, required: true },
  ability1: { type: String, required: true },
  champion2: { type: String, required: true },
  ability2: { type: String, required: true },
  videoURL: { type: String, required: true },
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  dateUploaded: { type: Date, default: Date.now },
  tags: [String],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
});

// Create indexes for faster querying
VideoSchema.index({ champion1: 1, ability1: 1, champion2: 1, ability2: 1 }, { unique: true });

module.exports = mongoose.model('Video', VideoSchema);
