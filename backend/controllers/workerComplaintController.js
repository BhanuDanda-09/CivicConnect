// ==============================================================================
// Field Worker Complaint Controller (workerComplaintController.js)
// ==============================================================================

const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const { uploadMultipleFiles } = require('../services/cloudinaryService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { findComplaintByIdentifier } = require('./complaintController');

/**
 * @desc    Get all complaints assigned to the authenticated field worker
 * @route   GET /api/workers/complaints
 * @access  Private (Worker only)
 */
const getAssignedComplaints = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;

  const query = { assignedWorker: req.user._id };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const complaints = await Complaint.find(query)
    .sort({ createdAt: -1 })
    .populate('citizen', 'fullName email mobileNumber address avatar');

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

/**
 * @desc    Get single assigned complaint details for worker
 * @route   GET /api/workers/complaints/:id
 * @access  Private (Assigned Worker only)
 */
const getAssignedComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Assigned task #${id} could not be found.`);
  }

  // Ensure task is assigned to this specific worker
  if (
    !complaint.assignedWorker ||
    complaint.assignedWorker.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      'Forbidden: You are not authorized to access tasks assigned to other workers.'
    );
  }

  await complaint.populate('citizen', 'fullName email mobileNumber address avatar');

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

/**
 * @desc    Mark assigned complaint as IN_PROGRESS when field worker arrives on site
 * @route   PATCH /api/workers/complaints/:id/start
 * @access  Private (Assigned Worker only)
 */
const startWork = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Task #${id} could not be found.`);
  }

  // Check worker assignment
  if (
    !complaint.assignedWorker ||
    complaint.assignedWorker.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      'Forbidden: You can only start tasks that are assigned to you.'
    );
  }

  if (complaint.status !== 'ASSIGNED') {
    throw new ApiError(
      400,
      `Cannot start work on task in '${complaint.status}' status. Task must be in 'ASSIGNED' state.`
    );
  }

  const previousStatus = complaint.status;
  complaint.status = 'IN_PROGRESS';
  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'IN_PROGRESS',
    previousStatus,
    newStatus: 'IN_PROGRESS',
    changedBy: req.user._id,
    remarks: remarks || 'Field personnel arrived on site. Remediation work in progress.',
    timestamp: new Date(),
  });

  res.status(200).json({
    success: true,
    message: `Work started on complaint #${complaint.complaintId}. Status changed to IN_PROGRESS.`,
    data: complaint,
  });
});

/**
 * @desc    Complete and resolve complaint with photographic proof
 * @route   PATCH /api/workers/complaints/:id/resolve
 * @access  Private (Assigned Worker only)
 */
const resolveComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolutionRemarks, remarks, resolutionImageUrl } = req.body;

  const notes = resolutionRemarks || remarks;
  if (!notes || notes.trim().length < 5) {
    throw new ApiError(
      400,
      'Resolution remarks describing work completed (minimum 5 characters) are mandatory.'
    );
  }

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Task #${id} could not be found.`);
  }

  // Check worker assignment
  if (
    !complaint.assignedWorker ||
    complaint.assignedWorker.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      'Forbidden: You cannot resolve complaints assigned to another worker.'
    );
  }

  if (complaint.status !== 'IN_PROGRESS' && complaint.status !== 'ASSIGNED') {
    throw new ApiError(
      400,
      `Cannot resolve complaint currently in '${complaint.status}' status.`
    );
  }

  // Upload resolution evidence photos to Cloudinary
  let uploadedResolutionPhotos = [];
  if (req.files && req.files.length > 0) {
    uploadedResolutionPhotos = await uploadMultipleFiles(
      req.files,
      'civicconnect/resolutions'
    );
  }

  const resImages = uploadedResolutionPhotos.map((img) => img.url);
  const resImageDetails = uploadedResolutionPhotos.map((img) => ({
    url: img.url,
    publicId: img.publicId,
  }));

  if (resImages.length === 0 && resolutionImageUrl) {
    resImages.push(resolutionImageUrl);
    resImageDetails.push({ url: resolutionImageUrl, publicId: '' });
  }

  // Require at least 1 resolution photo
  if (resImages.length === 0) {
    throw new ApiError(
      400,
      'Resolution rejected: At least one completion photograph is required as physical proof.'
    );
  }

  const previousStatus = complaint.status;
  complaint.status = 'RESOLVED';
  complaint.resolutionRemarks = notes.trim();
  complaint.resolutionImages = resImages;
  complaint.resolutionImageDetails = resImageDetails;
  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'RESOLVED',
    previousStatus,
    newStatus: 'RESOLVED',
    changedBy: req.user._id,
    remarks: notes.trim(),
    timestamp: new Date(),
  });

  res.status(200).json({
    success: true,
    message: `Complaint #${complaint.complaintId} has been successfully resolved with photographic proof.`,
    data: complaint,
  });
});

module.exports = {
  getAssignedComplaints,
  getAssignedComplaintById,
  startWork,
  resolveComplaint,
};

