const mongoose = require('mongoose');

// Sub-schema for replies
const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true, maxlength: 500 },
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false }
});

const SkinCommentSchema = new mongoose.Schema({
  skinId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Comment content
  comment: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  },
  
  // Engagement metrics
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who liked
  
  // Replies system
  replies: [ReplySchema],
  
  // Timestamps
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false }
});

// Create indexes for faster querying
SkinCommentSchema.index({ skinId: 1, dateCreated: -1 }); // Get comments by skin, newest first
SkinCommentSchema.index({ userId: 1 });
SkinCommentSchema.index({ 'likedBy': 1 });

module.exports = mongoose.model('SkinComment', SkinCommentSchema); 