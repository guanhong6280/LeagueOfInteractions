const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 },
  rank: String,
  sex: { type: String, enum: ['male', 'female', 'other', 'prefer not to say'] },
  homeCountry: String,
  favoriteChampions: { type: [String], maxLength: 5 },
  isAdministrator: { type: Boolean, default: false },
  profilePictureURL: String,
  dateRegistered: { type: Date, default: Date.now },
  lastActiveDate: Date,
  googleId: String,
  isProfileComplete: { type: Boolean, default: false },
  timeJoinedTheGame: { type: Number, min: 2009, max: new Date().getFullYear() }, // Year value (LoL released in 2009)
  riotAccounts: { type: [String] }, // Array of Riot account names
  
  // NEW FIELDS FOR SKIN RATING FEATURES
  skinRatingStats: {
    totalRatings: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    averageRatingGiven: { type: Number, default: 0 }
  },
  favoriteSkins: [{ type: Number }], // Array of skin IDs
  skinRatingHistory: [{ // Recent rating activity
    skinId: { type: Number },
    dateRated: { type: Date, default: Date.now },
    splashRating: { type: Number, min: 1, max: 5 },
    modelRating: { type: Number, min: 1, max: 5 }
  }],
  skinCommentHistory: [{ // Recent comment activity
    skinId: { type: Number },
    dateCommented: { type: Date, default: Date.now },
    commentPreview: { type: String, maxlength: 100 }
  }]
});

module.exports = mongoose.model('User', UserSchema);
