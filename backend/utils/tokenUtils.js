// ==============================================================================
// JWT & Token Generation Utilities (tokenUtils.js)
// ==============================================================================

const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for an authenticated user
 * @param {Object} user - Mongoose User document or plain object
 * @returns {string} Signed JWT string
 */
const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    role: user.role,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_civicconnect_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '1d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifies a JWT token signature and expiration
 * @param {string} token - Raw JWT token string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_civicconnect_change_in_production';
  return jwt.verify(token, secret);
};

/**
 * Sends a structured HTTP response with token and sanitized user details
 * @param {Object} user - User document
 * @param {number} statusCode - HTTP status code (200, 201)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendTokenResponse = (user, statusCode, res, message = 'Authentication successful') => {
  const token = generateToken(user);

  // Cookie options if cookies are enabled
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  };

  // Set auth cookie
  res.cookie('token', token, cookieOptions);

  // Format clean user object without password
  const sanitizedUser = user.toJSON ? user.toJSON() : { ...user };
  delete sanitizedUser.password;
  delete sanitizedUser.__v;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: sanitizedUser,
  });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse,
};
