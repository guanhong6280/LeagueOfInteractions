// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');

const router = express.Router();

// Initiate Google authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', keepSessionInfo: true }),
  (req, res) => {
    // Redirect to the home page or desired route
    res.redirect('http://localhost:5173/');
  }
);

router.get("/user", userController.getUser);
// Logout route
router.get('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect('/');
  });

});

module.exports = router;

