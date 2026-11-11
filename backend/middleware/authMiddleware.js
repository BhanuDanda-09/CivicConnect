// ==============================================================================
// JWT Authentication Protection Middleware (authMiddleware.js)
// ==============================================================================

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/tokenUtils');

/**
 * Protect routes: Validates incoming JWT from Authorization header or cookie
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in HTTP Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback to HTTP cookie if cookie-parser is used
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is provided
  if (!token) {
    throw new ApiError(401, 'Access denied: Authentication token is missing. Please log in.');
  }

  try {
    // Verify signature & expiration
    const decoded = verifyToken(token);

    // Retrieve active user from database
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      throw new ApiError(401, 'The user belonging to this token no longer exists.');
    }

    if (!currentUser.isActive) {
      throw new ApiError(401, 'Your account has been deactivated. Please contact municipal support.');
    }

    // Attach user to request context
    req.user = currentUser;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token. Please log in again.');
  }
});

/**
 * Optional Auth: Attaches user to req.user if a valid token exists, but doesn't block unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
    }
  } catch (err) {
    // Graceful fallback without failing the request
  }
  next();
};

const { authorize } = require('./roleMiddleware');

module.exports = {
  protect,
  optionalAuth,
  authorize,
};
