// ==============================================================================
// Municipal Administrator Analytics Routes (adminAnalyticsRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getAdminOverview,
  getWorkerPerformance,
  getWardAnalytics,
  getComplaintLocations,
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin analytics require authentication and strictly ADMIN role
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getAdminOverview);
router.get('/workers', getWorkerPerformance);
router.get('/wards', getWardAnalytics);
router.get('/complaint-locations', getComplaintLocations);

module.exports = router;
