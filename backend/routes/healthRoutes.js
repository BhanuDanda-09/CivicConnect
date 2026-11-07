// ==============================================================================
// Health Check Routes (GET /api/health)
// ==============================================================================

const express = require('express');
const router = express.Router();
const { isDBConnected } = require('../config/database');

/**
 * @route   GET /api/health
 * @desc    Comprehensive health check for server and database connectivity
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = isDBConnected() ? 'connected' : 'disconnected';
  const isHealthy = true; // Server process is running and responding

  const responsePayload = {
    success: true,
    message: 'CivicConnect API is running',
    server: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    application: 'CivicConnect',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
  };

  // If DB is disconnected, respond with 503 Service Unavailable so monitoring systems (Prometheus, K8s) detect it
  if (!isDBConnected()) {
    return res.status(503).json({
      ...responsePayload,
      warning: 'Database is currently disconnected. Background retry in progress.',
    });
  }

  res.status(200).json(responsePayload);
});

module.exports = router;
