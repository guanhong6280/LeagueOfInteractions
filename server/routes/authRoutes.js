// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');

const router = express.Router();

// Initiate Google authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// Handle callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', keepSessionInfo: true }),
  (req, res) => {
    console.log('successfully authenticated');
    res.status(200).redirect('http://localhost:5173');
  },
);

// Handle fetch user from frontend
router.get('/user', userController.getUser);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: 'Logged out succesfully' });
  });
});

module.exports = router;

