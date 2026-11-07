// ==============================================================================
// Field Worker Complaint Routes (workerComplaintRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  getAssignedComplaints,
  getAssignedComplaintById,
  startWork,
  resolveComplaint,
} = require('../controllers/workerComplaintController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadResolutionPhotos } = require('../middleware/uploadMiddleware');
const {
  validateResolveComplaint,
  validateMongoIdParam,
} = require('../middleware/complaintValidation');

// All worker routes require authentication and strictly WORKER role
router.use(protect);
router.use(authorize('worker'));

// Listing & details
router.get('/', getAssignedComplaints);
router.get('/:id', validateMongoIdParam('id'), getAssignedComplaintById);

// Task lifecycle transitions
router.patch('/:id/start', validateMongoIdParam('id'), startWork);
router.patch(
  '/:id/resolve',
  validateMongoIdParam('id'),
  uploadResolutionPhotos,
  validateResolveComplaint,
  resolveComplaint
);

module.exports = router;

