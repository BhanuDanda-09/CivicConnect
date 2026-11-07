// ==============================================================================
// Admin Municipal Worker Routes (adminWorkerRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getWorkers,
  createWorker,
} = require('../controllers/adminWorkerController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All worker management routes require authentication and strictly ADMIN role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getWorkers);
router.post('/', createWorker);

module.exports = router;
