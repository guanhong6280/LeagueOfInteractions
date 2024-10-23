// server/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create a new user with basic information from Google
        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          profilePictureURL: profile.photos[0].value,
          // No need to set isProfileComplete to false explicitly
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        done(error, null);
      }
    }
  )
);

module.exports.passport = passport;
