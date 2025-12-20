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
  favoriteSkins: [{ type: Number }], // Array of skin IDs
  mainRoles: {
    type: [String],
    enum: ['Top', 'Jungle', 'Mid', 'Bot', 'Support'],
    validate: [(val) => val.length <= 2, '{PATH} exceeds the limit of 2']
  },
  preferredGameModes: {
    type: [String],
    enum: ["Normal","Draft Pick","Ranked Solo/Duo", "Ranked Flex", "ARAM", "Arena", "TFT", "ARAM MAYHEM", "URF"],
    validate: [(val) => val.length <= 2, '{PATH} exceeds the limit of 2']
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true
});

UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;  // Remove raw '_id'
    delete ret.password; // Security: Always remove passwords!
    delete ret.googleId; // Optional: Hide OAuth IDs if not needed
  }
});

module.exports = mongoose.model('User', UserSchema);
