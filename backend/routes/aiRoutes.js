// ==============================================================================
// AI Civic Routes (aiRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or Citizen routes
router.post('/classify', aiController.classifyComplaint);
router.post('/check-duplicates', aiController.checkDuplicates);
router.post('/assistant', aiController.assistantInquiry);
router.get('/hotspots', aiController.getHotspots);

// Admin-only SLA escalations monitoring
router.get('/escalations', protect, authorize('admin'), aiController.getEscalations);

module.exports = router;

