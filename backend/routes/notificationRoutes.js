// ==============================================================================
// Real-Time Notification Routes (notificationRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/authMiddleware');
const { validateMongoIdParam } = require('../middleware/complaintValidation');

// All notification endpoints require authenticated session
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', validateMongoIdParam('id'), markAsRead);

module.exports = router;

