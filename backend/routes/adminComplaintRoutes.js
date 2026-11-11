// ==============================================================================
// Municipal Administrator Complaint Routes (adminComplaintRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getAllComplaints,
  verifyComplaint,
  rejectComplaint,
  assignWorker,
  changePriority,
  getAdminStats,
  getAuditLogs,
} = require('../controllers/adminComplaintController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  validateAssignWorker,
  validateRejectComplaint,
  validatePriorityChange,
  validateMongoIdParam,
} = require('../middleware/complaintValidation');

// All admin routes require authentication and strictly ADMIN role
router.use(protect);
router.use(authorize('admin'));

// Listing & aggregated stats
router.get('/', getAllComplaints);
router.get('/stats', getAdminStats);
router.get('/audit-logs', getAuditLogs);

// Status transition and assignment actions
router.patch('/:id/verify', validateMongoIdParam('id'), verifyComplaint);
router.patch(
  '/:id/reject',
  validateMongoIdParam('id'),
  validateRejectComplaint,
  rejectComplaint
);
router.patch(
  '/:id/assign',
  validateMongoIdParam('id'),
  validateAssignWorker,
  assignWorker
);
router.patch(
  '/:id/priority',
  validateMongoIdParam('id'),
  validatePriorityChange,
  changePriority
);

module.exports = router;

