// ==============================================================================
// Admin User Management Routes (adminUserRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/adminUserController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All user management routes require authentication and strictly ADMIN role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;
