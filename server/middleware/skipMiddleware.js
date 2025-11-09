function skipMiddleware(middleware, pathsToSkip) {
  const skipList = Array.isArray(pathsToSkip) ? pathsToSkip : [pathsToSkip];
  return (req, res, next) => {
    if (skipList.includes(req.path)) {
      return next();
    }
    middleware(req, res, next);
  };
}

module.exports = skipMiddleware;
