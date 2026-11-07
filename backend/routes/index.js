// ==============================================================================
// Central API Router (Mounted at /api)
// ==============================================================================

const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');

// Active route: Health Check API
router.use('/health', healthRoutes);

// Root /api info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CivicConnect REST API',
    version: '1.0.0',
    phase: 'Phase 3 - Backend Setup & Database Connection Completed',
    endpoints: {
      health: '/api/health',
      // Future endpoints configured in Phase 4 & 5:
      auth: '/api/auth (Phase 4)',
      users: '/api/users (Phase 4)',
      complaints: '/api/complaints (Phase 5)',
      workers: '/api/workers (Phase 5)',
      feedback: '/api/feedback (Phase 5)',
      notifications: '/api/notifications (Phase 5)',
    },
  });
});

module.exports = router;
