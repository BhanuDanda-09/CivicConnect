// ==============================================================================
// Async Handler Utility (replaces repetitive try-catch blocks in controllers)
// ==============================================================================

/**
 * Wraps an async express route handler and forwards rejected promises to next()
 * @param {Function} requestHandler - (req, res, next) async function
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;

