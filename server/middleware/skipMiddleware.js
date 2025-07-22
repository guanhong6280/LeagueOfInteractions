function skipMiddleware(middleware, pathToSkip) {
  return (req, res, next) => {
    if (req.path === pathToSkip) {
      return next(); // Skip the middleware for the specified path
    }
    middleware(req, res, next); // Otherwise, apply the middleware
  };
}

module.exports = skipMiddleware;
