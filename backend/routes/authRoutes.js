// ==============================================================================
// Authentication Routes (authRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  getMe,
  logout,
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
} = require('../middleware/validatorMiddleware');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Security: Dedicated Rate Limiter for Authentication Endpoints (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP. Please retry after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip during automated tests
});

// Public Authentication Endpoints
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);

// Protected Authentication Endpoints
router.get('/me', protect, getMe);

// Example role-protected route for verification/testing
router.get('/admin-check', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted to admin-only resource.',
    user: req.user,
  });
});

module.exports = router;

