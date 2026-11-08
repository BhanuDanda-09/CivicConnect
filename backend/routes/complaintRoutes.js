// ==============================================================================
// Citizen Complaint Routes (complaintRoutes.js)
// ==============================================================================

const express = require('express');
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  getComplaintHistory,
  trackComplaintPublic,
} = require('../controllers/complaintController');

const {
  submitFeedback,
  getComplaintFeedback,
} = require('../controllers/feedbackController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadComplaintPhotos } = require('../middleware/uploadMiddleware');
const {
  validateComplaintCreation,
  validateMongoIdParam,
} = require('../middleware/complaintValidation');

// Public complaint tracking (No login required - safe sanitized data)
router.get('/track/:identifier', trackComplaintPublic);
router.get('/public/track/:identifier', trackComplaintPublic);

// All subsequent complaint routes require verified authentication
router.use(protect);

// Citizen routes
router.post(
  '/',
  authorize('citizen'),
  uploadComplaintPhotos,
  validateComplaintCreation,
  createComplaint
);

router.get('/my', authorize('citizen'), getMyComplaints);

// Citizen feedback on resolved complaint
router.post(
  '/:id/feedback',
  validateMongoIdParam('id'),
  authorize('citizen'),
  submitFeedback
);
router.get(
  '/:id/feedback',
  validateMongoIdParam('id'),
  getComplaintFeedback
);

// Shared protected detail routes (Owner, Admin, or Assigned Worker)
router.get('/:id', validateMongoIdParam('id'), getComplaintById);
router.patch('/:id', validateMongoIdParam('id'), updateComplaint);
router.get('/:id/history', validateMongoIdParam('id'), getComplaintHistory);

module.exports = router;
