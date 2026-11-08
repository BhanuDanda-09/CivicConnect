// ==============================================================================
// Municipal Administrator Complaint Controller (adminComplaintController.js)
// ==============================================================================

const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const User = require('../models/User');
const { createAndDispatchNotification } = require('./notificationController');
const { emitToUser, emitToRole } = require('../services/socketService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { findComplaintByIdentifier } = require('./complaintController');

/**
 * @desc    Get all complaints across the municipality with advanced filtering, pagination, and search
 * @route   GET /api/admin/complaints
 * @access  Private (Admin only)
 */
const getAllComplaints = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    priority,
    ward,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = {};

  // Text search on title, description, or complaintId
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { complaintId: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
    ];
  }

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (ward) filter.ward = ward;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortDirection };

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('citizen', 'fullName email mobileNumber address avatar')
      .populate('assignedWorker', 'fullName email mobileNumber avatar'),
    Complaint.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    count: complaints.length,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: complaints,
  });
});

/**
 * @desc    Verify a submitted complaint
 * @route   PATCH /api/admin/complaints/:id/verify
 * @access  Private (Admin only)
 */
const verifyComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  // Prevent invalid transitions
  if (complaint.status === 'REJECTED') {
    throw new ApiError(400, 'Cannot verify a complaint that has already been rejected.');
  }
  if (complaint.status === 'RESOLVED' || complaint.status === 'CITIZEN_FEEDBACK') {
    throw new ApiError(400, 'Complaint has already been resolved and closed.');
  }

  const previousStatus = complaint.status;
  complaint.status = 'VERIFIED';
  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'VERIFIED',
    previousStatus,
    newStatus: 'VERIFIED',
    changedBy: req.user._id,
    remarks: remarks || 'Complaint inspected and verified by municipal desk. Approved for worker dispatch.',
    timestamp: new Date(),
  });

  // Real-time dispatch to citizen and administrators
  await createAndDispatchNotification({
    recipient: complaint.citizen,
    title: 'Grievance Verified',
    message: `Your complaint #${complaint.complaintId} has been verified and approved for field crew dispatch.`,
    type: 'VERIFICATION',
    relatedComplaint: complaint._id,
  });

  emitToUser(complaint.citizen, 'complaint:updated', {
    complaintId: complaint.complaintId,
    status: 'VERIFIED',
  });
  emitToRole('admin', 'complaint:updated', {
    complaintId: complaint.complaintId,
    status: 'VERIFIED',
  });

  res.status(200).json({
    success: true,
    message: `Complaint #${complaint.complaintId} has been verified successfully.`,
    data: complaint,
  });
});

/**
 * @desc    Reject an invalid or duplicate complaint
 * @route   PATCH /api/admin/complaints/:id/reject
 * @access  Private (Admin only)
 */
const rejectComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim().length < 5) {
    throw new ApiError(400, 'A valid rejection reason (minimum 5 characters) must be provided.');
  }

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  if (complaint.status === 'RESOLVED' || complaint.status === 'IN_PROGRESS') {
    throw new ApiError(400, `Cannot reject a complaint that is currently '${complaint.status}'.`);
  }

  const previousStatus = complaint.status;
  complaint.status = 'REJECTED';
  complaint.rejectionReason = rejectionReason.trim();
  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'REJECTED',
    previousStatus,
    newStatus: 'REJECTED',
    changedBy: req.user._id,
    remarks: rejectionReason.trim(),
    timestamp: new Date(),
  });

  // Real-time dispatch to citizen
  await createAndDispatchNotification({
    recipient: complaint.citizen,
    title: 'Grievance Rejected',
    message: `Your complaint #${complaint.complaintId} was rejected. Note: "${rejectionReason.trim()}".`,
    type: 'STATUS_UPDATE',
    relatedComplaint: complaint._id,
  });

  emitToUser(complaint.citizen, 'complaint:updated', {
    complaintId: complaint.complaintId,
    status: 'REJECTED',
    rejectionReason: rejectionReason.trim(),
  });
  emitToRole('admin', 'complaint:updated', {
    complaintId: complaint.complaintId,
    status: 'REJECTED',
  });

  res.status(200).json({
    success: true,
    message: `Complaint #${complaint.complaintId} has been rejected.`,
    data: complaint,
  });
});

/**
 * @desc    Assign a verified complaint to a municipal field worker
 * @route   PATCH /api/admin/complaints/:id/assign
 * @access  Private (Admin only)
 */
const assignWorker = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { workerId, priority, remarks } = req.body;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  if (complaint.status === 'REJECTED') {
    throw new ApiError(400, 'Cannot assign a rejected complaint to a field worker.');
  }
  if (complaint.status === 'RESOLVED' || complaint.status === 'CITIZEN_FEEDBACK') {
    throw new ApiError(400, 'Cannot reassign a complaint that is already resolved.');
  }

  // Verify worker account
  const worker = await User.findById(workerId);
  if (!worker) {
    throw new ApiError(404, 'Selected municipal worker could not be found.');
  }

  const workerRole = (worker.role || '').toLowerCase();
  if (workerRole !== 'worker') {
    throw new ApiError(400, `User '${worker.fullName}' does not have the 'worker' role (Role is: ${worker.role}).`);
  }

  if (!worker.isActive) {
    throw new ApiError(400, `Worker account '${worker.fullName}' is currently deactivated.`);
  }

  const previousStatus = complaint.status;
  complaint.assignedWorker = worker._id;
  complaint.status = 'ASSIGNED';
  if (priority) {
    complaint.priority = priority;
  }
  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'ASSIGNED',
    previousStatus,
    newStatus: 'ASSIGNED',
    changedBy: req.user._id,
    remarks: remarks || `Assigned to field worker ${worker.fullName}.`,
    timestamp: new Date(),
  });

  // Real-time dispatch to assigned field worker and citizen
  await Promise.all([
    createAndDispatchNotification({
      recipient: worker._id,
      title: 'New Work Order Assigned',
      message: `You have been dispatched to complaint #${complaint.complaintId} in ${complaint.ward}.`,
      type: 'ASSIGNMENT',
      relatedComplaint: complaint._id,
    }),
    createAndDispatchNotification({
      recipient: complaint.citizen,
      title: 'Field Officer Dispatched',
      message: `Municipal officer ${worker.fullName} (${worker.trade || 'Field Crew'}) has been dispatched to resolve #${complaint.complaintId}.`,
      type: 'STATUS_UPDATE',
      relatedComplaint: complaint._id,
    }),
  ]);

  emitToUser(worker._id, 'complaint:assigned', {
    complaintId: complaint.complaintId,
    title: complaint.title,
    ward: complaint.ward,
    priority: complaint.priority,
  });
  emitToUser(complaint.citizen, 'complaint:updated', {
    complaintId: complaint.complaintId,
    status: 'ASSIGNED',
    workerName: worker.fullName,
  });
  emitToRole('admin', 'complaint:updated', {
    complaintId: complaint.complaintId,
    status: 'ASSIGNED',
  });

  await complaint.populate('assignedWorker', 'fullName email mobileNumber avatar');

  res.status(200).json({
    success: true,
    message: `Complaint #${complaint.complaintId} assigned to ${worker.fullName}.`,
    data: complaint,
  });
});

/**
 * @desc    Change priority level of a complaint
 * @route   PATCH /api/admin/complaints/:id/priority
 * @access  Private (Admin only)
 */
const changePriority = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { priority, remarks } = req.body;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  const previousPriority = complaint.priority;
  complaint.priority = priority;
  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'PRIORITY_CHANGED',
    previousStatus: complaint.status,
    newStatus: complaint.status,
    changedBy: req.user._id,
    remarks: remarks || `Priority adjusted from ${previousPriority} to ${priority}.`,
    timestamp: new Date(),
  });

  res.status(200).json({
    success: true,
    message: `Complaint #${complaint.complaintId} priority changed to ${priority}.`,
    data: complaint,
  });
});

/**
 * @desc    Get aggregated municipal statistics for admin dashboard
 * @route   GET /api/admin/complaints/stats
 * @access  Private (Admin only)
 */
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    total,
    submitted,
    underVerification,
    verified,
    assigned,
    inProgress,
    resolved,
    rejected,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'SUBMITTED' }),
    Complaint.countDocuments({ status: 'UNDER_VERIFICATION' }),
    Complaint.countDocuments({ status: 'VERIFIED' }),
    Complaint.countDocuments({ status: 'ASSIGNED' }),
    Complaint.countDocuments({ status: 'IN_PROGRESS' }),
    Complaint.countDocuments({ status: { $in: ['RESOLVED', 'CITIZEN_FEEDBACK'] } }),
    Complaint.countDocuments({ status: 'REJECTED' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      pending: submitted + underVerification,
      submitted,
      underVerification,
      verified,
      assigned,
      inProgress,
      resolved,
      rejected,
    },
  });
});

module.exports = {
  getAllComplaints,
  verifyComplaint,
  rejectComplaint,
  assignWorker,
  changePriority,
  getAdminStats,
};

