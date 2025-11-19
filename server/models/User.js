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
  recentSkinRatings: {
    type: [{
      skinId: { type: String, required: true },
      dateUpdated: { type: Date, required: true },
      splashArtRating: { type: Number, required: true },
      inGameModelRating: { type: Number, required: true },
    }],
    validate: {
      validator: function(arr) {
        return arr.length <= 10;
      },
      message: 'Recent skin ratings cannot exceed 10 items',
    },
  },
  recentSkinComments: {
    type: [{
      skinId: { type: String, required: true },
      dateUpdated: { type: Date, required: true },
      comment: { type: String, required: true },
    }],
    validate: {
      validator: function(arr) {
        return arr.length <= 10;
      },
      message: 'Recent skin comments cannot exceed 10 items',
    },
  },
  recentChampionComments: {
    type: [{
      championId: { type: String, required: true },
      dateUpdated: { type: Date, required: true },
      comment: { type: String, required: true },
    }],
    validate: {
      validator: function(arr) {
        return arr.length <= 10;
      },
      message: 'Recent champion comments cannot exceed 10 items',
    },
  },
  favoriteSkins: [{ type: Number }], // Array of skin IDs
});

module.exports = mongoose.model('User', UserSchema);
