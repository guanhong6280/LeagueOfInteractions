const mongoose = require('mongoose');

// I will probably just grab the views and likes and comment counts from youtube? can i do that?
const VideoSchema = new mongoose.Schema({
  champion1: { type: String, required: true },
  ability1: { type: String, required: true },
  champion2: { type: String, required: true },
  ability2: { type: String, required: true },
  interactionKey: { type: String, index: true },
  // For YouTube provider; optional for Mux
  videoURL: { type: String },
  provider: { type: String, enum: ['youtube', 'mux'], default: 'youtube' },
  // Mux specific fields
  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'], default: 'uploading' },
  assetId: { type: String },
  playbackId: { type: String },
  playbackUrl: { type: String },
  directUploadId: { type: String },
  duration: { type: Number }, // seconds
  aspectRatio: { type: String },
  maxResolution: { type: String },
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  dateUploaded: { type: Date, default: Date.now },
  tags: [String],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked the video
  commentsCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  moderatedAt: { type: Date, default: null },
  moderatorNotes: { type: String, default: '' },
}, { timestamps: true });

// Create indexes for faster querying
// NOTE: If an existing unique compound index exists in MongoDB, drop it manually/migration
VideoSchema.index({ directUploadId: 1 });
VideoSchema.index({ assetId: 1 });
VideoSchema.index({ moderationStatus: 1, createdAt: -1 });
// Only one approved per interaction
VideoSchema.index(
  { interactionKey: 1 },
  { unique: true, partialFilterExpression: { isApproved: true } },
);

module.exports = mongoose.model('Video', VideoSchema);
