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
  isProfileComplete: {type: Boolean, default: false},
  timeJoinedTheGame: { type: Number, min: 2009, max: new Date().getFullYear() }, // Year value (LoL released in 2009)
  riotAccounts: { type: [String] } // Array of Riot account names
});

// Create an index on username and email for uniqueness
UserSchema.index({ username: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
