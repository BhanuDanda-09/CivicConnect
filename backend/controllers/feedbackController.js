// ==============================================================================
// Citizen Feedback Controller (feedbackController.js)
// Post-resolution quality rating, feedback submission, and citizen satisfaction
// ==============================================================================

const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { findComplaintByIdentifier } = require('./complaintController');
const { createAndDispatchNotification } = require('./notificationController');
const { emitToRole, emitToUser } = require('../services/socketService');

/**
 * @desc    Submit citizen satisfaction rating and feedback for a resolved complaint
 * @route   POST /api/complaints/:id/feedback
 * @access  Private (Citizen owner only)
 */
const submitFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    throw new ApiError(400, 'Please provide a valid satisfaction rating between 1 and 5 stars.');
  }

  if (!comment || comment.trim().length < 3) {
    throw new ApiError(400, 'Feedback comment must be at least 3 characters long.');
  }

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  // 1. Verify authenticated user is the citizen who submitted the complaint
  if (complaint.citizen.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You can only submit feedback for complaints you reported.');
  }

  // 2. Verify complaint is in an eligible resolved state
  if (complaint.status !== 'RESOLVED' && complaint.status !== 'CITIZEN_FEEDBACK') {
    throw new ApiError(
      400,
      `Feedback can only be submitted for resolved complaints. Current status: '${complaint.status}'.`
    );
  }

  // 3. Prevent duplicate feedback submissions
  const existingFeedback = await Feedback.findOne({ complaint: complaint._id });
  if (existingFeedback) {
    throw new ApiError(409, 'Citizen feedback has already been recorded for this complaint.');
  }

  // 4. Create Feedback document
  const feedback = await Feedback.create({
    complaint: complaint._id,
    citizen: req.user._id,
    rating: ratingNum,
    comment: comment.trim(),
  });

  // 5. Update complaint status to CITIZEN_FEEDBACK
  const previousStatus = complaint.status;
  complaint.status = 'CITIZEN_FEEDBACK';
  await complaint.save();

  // 6. Record in chronological audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'CITIZEN_FEEDBACK_SUBMITTED',
    previousStatus,
    newStatus: 'CITIZEN_FEEDBACK',
    changedBy: req.user._id,
    remarks: `Citizen rated resolution ${ratingNum}/5 stars: "${comment.trim()}"`,
    timestamp: new Date(),
  });

  // 7. Dispatch notifications & real-time socket events
  if (complaint.assignedWorker) {
    await createAndDispatchNotification({
      recipient: complaint.assignedWorker,
      title: 'Citizen Review Received',
      message: `Citizen gave a ${ratingNum}-star review for complaint ${complaint.complaintId}.`,
      type: 'FEEDBACK_REQUEST',
      relatedComplaint: complaint._id,
    });
  }

  // Real-time broadcast to admins
  emitToRole('admin', 'feedback:submitted', {
    complaintId: complaint.complaintId,
    rating: ratingNum,
    comment: comment.trim(),
    ward: complaint.ward,
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your feedback on the municipal resolution has been recorded.',
    data: feedback,
  });
});

/**
 * @desc    Get feedback submission for a specific complaint
 * @route   GET /api/complaints/:id/feedback
 * @access  Private (Owner, Admin, or Assigned Worker)
 */
const getComplaintFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  const feedback = await Feedback.findOne({ complaint: complaint._id }).populate(
    'citizen',
    'fullName email'
  );

  if (!feedback) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No feedback has been recorded for this complaint yet.',
    });
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

/**
 * @desc    Get all feedback records across the municipality (with stats)
 * @route   GET /api/feedback
 * @access  Private (Admin only)
 */
const getAllFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [feedbackList, total, ratingStats] = await Promise.all([
    Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('complaint', 'complaintId title category ward')
      .populate('citizen', 'fullName email'),
    Feedback.countDocuments(),
    Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]),
  ]);

  const avgRating = ratingStats.length > 0 ? Number(ratingStats[0].avgRating.toFixed(2)) : 5.0;

  res.status(200).json({
    success: true,
    total,
    averageRating: avgRating,
    count: feedbackList.length,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: feedbackList,
  });
});

module.exports = {
  submitFeedback,
  getComplaintFeedback,
  getAllFeedback,
};

