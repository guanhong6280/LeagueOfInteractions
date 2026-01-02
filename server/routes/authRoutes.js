// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const userController = require('../controllers/user/userController');

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const isSafeReturnTo = (returnTo) => {
  if (!returnTo || typeof returnTo !== 'string') return false;

  // Allow relative paths only (prevents open redirects)
  if (returnTo.startsWith('/')) {
    // Block protocol-relative URLs like "//evil.com"
    if (returnTo.startsWith('//')) return false;
    return true;
  }

  // Optionally allow absolute URLs only if they match CLIENT_URL origin
  try {
    const target = new URL(returnTo);
    const allowed = new URL(CLIENT_URL);
    return target.origin === allowed.origin;
  } catch {
    return false;
  }
};

const resolveRedirectUrl = (returnTo) => {
  if (!isSafeReturnTo(returnTo)) return CLIENT_URL;
  if (returnTo.startsWith('/')) return `${CLIENT_URL}${returnTo}`;
  return returnTo;
};

// Initiate Google authentication
router.get(
  '/google',
  (req, res, next) => {
    const { returnTo } = req.query;
    if (isSafeReturnTo(returnTo)) {
      req.session.returnTo = returnTo;
    } else {
      delete req.session.returnTo;
    }
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// Handle callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: CLIENT_URL, keepSessionInfo: true }),
  (req, res) => {
    const returnTo = req.session?.returnTo;
    if (req.session) delete req.session.returnTo;
    res.redirect(resolveRedirectUrl(returnTo));
  },
);

// Handle fetch user from frontend
router.get('/user', userController.getUser);

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: 'Logged out succesfully' });
  });
});

module.exports = router;

