// ==============================================================================
// Central API Router (Mounted at /api)
// ==============================================================================

const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');

// Active API Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Root /api information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CivicConnect REST API',
    version: '1.0.0',
    phase: 'Phase 4 - Authentication & Role-Based Access Control Implemented',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login',
      me: '/api/auth/me (Protected)',
      logout: '/api/auth/logout',
      // Future endpoints configured in Phase 5:
      complaints: '/api/complaints (Phase 5)',
      workers: '/api/workers (Phase 5)',
      feedback: '/api/feedback (Phase 5)',
      notifications: '/api/notifications (Phase 5)',
    },
  });
});

module.exports = router;
