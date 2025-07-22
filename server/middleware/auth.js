// server/middleware/auth.js

// For web routes (redirects to login)
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
};

// For API routes (returns JSON responses)
exports.ensureApiAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Authentication required.',
    message: 'Please log in to access this resource.'
  });
};

// Optional authentication - allows both authenticated and unauthenticated users
exports.optionalAuth = (req, res, next) => {
  // req.user will be undefined if not authenticated, but that's okay
  next();
};
