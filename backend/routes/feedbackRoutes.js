// ==============================================================================
// Citizen Feedback Routes (feedbackRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const { getAllFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Municipal administrators can review all citizen feedback
router.get('/', authorize('admin'), getAllFeedback);

module.exports = router;

