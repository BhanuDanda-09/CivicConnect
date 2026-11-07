// ==============================================================================
// Field Worker Analytics Routes (workerAnalyticsRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getWorkerOverview,
  getWorkerTaskLocations,
} = require('../controllers/workerAnalyticsController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Worker analytics require authentication and strictly WORKER role
router.use(protect);
router.use(authorize('worker'));

router.get('/overview', getWorkerOverview);
router.get('/task-locations', getWorkerTaskLocations);

module.exports = router;
