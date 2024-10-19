// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate Google authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect to the home page or desired route
    res.redirect('/');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;

