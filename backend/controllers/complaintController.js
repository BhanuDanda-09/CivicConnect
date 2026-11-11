// ==============================================================================
// Citizen & Shared Complaint Controller (complaintController.js)
// ==============================================================================

const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const { uploadMultipleFiles } = require('../services/cloudinaryService');
const { createAndDispatchNotification } = require('./notificationController');
const { emitToRole } = require('../services/socketService');
const { classifyComplaintText, detectNearbyDuplicates } = require('../services/aiCivicService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Finds a complaint by either MongoDB ObjectId or custom complaintId (e.g., CC-2026-0001)
 * Supports whitespace trimming, case-insensitivity, and leading '#' handling.
 * @param {string} idOrComplaintId
 */
const findComplaintByIdentifier = async (idOrComplaintId) => {
  if (!idOrComplaintId || typeof idOrComplaintId !== 'string') return null;

  // Trim whitespace and remove optional leading '#' or surrounding quotes
  const cleanId = idOrComplaintId.trim().replace(/^#/, '').replace(/^["']|["']$/g, '').trim();
  if (!cleanId) return null;

  // 1. Check if it's a valid 24-character hexadecimal MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(cleanId) && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
    const byMongoId = await Complaint.findById(cleanId);
    if (byMongoId) return byMongoId;
  }

  // 2. Fast exact match using uppercase (standard format: CC-YYYY-XXXX)
  const upper = cleanId.toUpperCase();
  let complaint = await Complaint.findOne({ complaintId: upper });
  if (complaint) return complaint;

  // 3. Fallback: Case-insensitive regex match (safely escaping special characters)
  const escaped = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  complaint = await Complaint.findOne({
    complaintId: { $regex: new RegExp(`^${escaped}$`, 'i') },
  });

  return complaint;
};

/**
 * @desc    Submit a new citizen complaint (with photo upload & geolocation)
 * @route   POST /api/complaints
 * @access  Private (Citizen only)
 */
const createComplaint = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    categoryLabel,
    location,
    country,
    state,
    district,
    city,
    pincode,
    latitude,
    longitude,
    ward,
    landmark,
    priority,
    imageUrl, // optional fallback if submitted via JSON
  } = req.body;

  // Process uploaded images via Cloudinary service
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = await uploadMultipleFiles(req.files, 'civicconnect/complaints');
  }

  // Combine Cloudinary URLs or fallback provided image
  const images = uploadedImages.map((img) => img.url);
  const imageDetails = uploadedImages.map((img) => ({
    url: img.url,
    publicId: img.publicId,
  }));

  if (images.length === 0 && imageUrl) {
    images.push(imageUrl);
    imageDetails.push({ url: imageUrl, publicId: '' });
  }

  // Generate unique complaint ID: CC-YYYY-XXXX
  const complaintId = await Complaint.generateComplaintId();

  // Validate and parse numerical coordinates (Leaflet lat/lng to GeoJSON [lng, lat])
  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);
  const latNum = !isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90 ? parsedLat : 20.5937;
  const lngNum = !isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180 ? parsedLng : 78.9629;

  // Automatic AI Civic Intelligence & Hazard Detection
  const aiAnalysis = classifyComplaintText({
    title,
    description,
    location,
  });

  const resolvedPriority =
    priority || (aiAnalysis.safetyHazard ? 'URGENT' : aiAnalysis.priority) || 'MEDIUM';

  // Check potential nearby duplicates
  const detectedDuplicates = await detectNearbyDuplicates({
    title,
    description,
    category,
    latitude: latNum,
    longitude: lngNum,
  });

  // Create new complaint document in MongoDB
  const complaint = new Complaint({
    complaintId,
    title,
    description,
    category,
    categoryLabel: categoryLabel || aiAnalysis.categoryLabel || category,
    location,
    country: country || 'India',
    state: state || '',
    district: district || '',
    city: city || '',
    pincode: pincode || '',
    latitude: latNum,
    longitude: lngNum,
    locationGeo: {
      type: 'Point',
      coordinates: [lngNum, latNum],
    },
    ward,
    landmark: landmark || '',
    priority: resolvedPriority,
    status: 'SUBMITTED',
    citizen: req.user._id, // Enforce authenticated citizen ownership
    images,
    imageDetails,
    assetId: req.body.assetId ? req.body.assetId.trim().toUpperCase() : '',
    aiClassification: {
      confidence: aiAnalysis.confidence,
      suggestedCategory: aiAnalysis.category,
      suggestedPriority: aiAnalysis.priority,
      department: aiAnalysis.department,
      safetyHazard: aiAnalysis.safetyHazard,
      keywords: aiAnalysis.keywords,
      explanation: aiAnalysis.explanation,
    },
    possibleDuplicates: detectedDuplicates.map((d) => ({
      complaintId: d.complaintId,
      similarityScore: d.similarityScore,
      reason: d.reason,
    })),
  });

  await complaint.save();

  // Create initial audit trail history record
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'SUBMITTED',
    previousStatus: null,
    newStatus: 'SUBMITTED',
    changedBy: req.user._id,
    remarks: 'Complaint logged and submitted to the municipal verification desk.',
    timestamp: new Date(),
  });

  // Real-time dispatch & notification
  await createAndDispatchNotification({
    recipient: req.user._id,
    title: 'Grievance Registered',
    message: `Your complaint #${complaint.complaintId} has been registered and is under municipal verification.`,
    type: 'STATUS_UPDATE',
    relatedComplaint: complaint._id,
  });

  emitToRole('admin', 'complaint:created', {
    complaintId: complaint.complaintId,
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    ward: complaint.ward,
  });

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    data: complaint,
  });
});

/**
 * @desc    Get all complaints submitted by the authenticated citizen
 * @route   GET /api/complaints/my
 * @access  Private (Citizen only)
 */
const getMyComplaints = asyncHandler(async (req, res) => {
  const { status, category } = req.query;

  const query = { citizen: req.user._id };
  if (status) query.status = status;
  if (category) query.category = category;

  const complaints = await Complaint.find(query)
    .sort({ createdAt: -1 })
    .populate('assignedWorker', 'fullName email mobileNumber avatar');

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

/**
 * @desc    Get single complaint details (Owner, Admin, or Assigned Worker)
 * @route   GET /api/complaints/:id
 * @access  Private
 */
const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  // Authorization check: Admin, Owner, or Assigned Worker
  const isOwner = complaint.citizen.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isAssignedWorker =
    complaint.assignedWorker &&
    complaint.assignedWorker.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isAssignedWorker) {
    throw new ApiError(
      403,
      'Forbidden: You are not authorized to view the details of this complaint.'
    );
  }

  await complaint.populate('citizen', 'fullName email mobileNumber address avatar');
  if (complaint.assignedWorker) {
    await complaint.populate('assignedWorker', 'fullName email mobileNumber avatar');
  }

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

/**
 * @desc    Update complaint details while in SUBMITTED status
 * @route   PATCH /api/complaints/:id
 * @access  Private (Owner citizen or Admin)
 */
const updateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  const isOwner = complaint.citizen.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Forbidden: You can only edit complaints that you submitted.');
  }

  // Citizens can only edit while in SUBMITTED status
  if (!isAdmin && complaint.status !== 'SUBMITTED') {
    throw new ApiError(
      400,
      `Complaint cannot be edited once it has transitioned to '${complaint.status}' status.`
    );
  }

  // Safe update fields (citizens cannot change status, citizen, or assignedWorker)
  const allowedFields = ['title', 'description', 'landmark', 'location', 'ward', 'latitude', 'longitude'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      complaint[field] = req.body[field];
    }
  });

  if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
    complaint.locationGeo = {
      type: 'Point',
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    };
  }

  await complaint.save();

  // Audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'DETAILS_UPDATED',
    previousStatus: complaint.status,
    newStatus: complaint.status,
    changedBy: req.user._id,
    remarks: 'Complaint details updated by citizen.',
    timestamp: new Date(),
  });

  res.status(200).json({
    success: true,
    message: 'Complaint details updated successfully',
    data: complaint,
  });
});

/**
 * @desc    Get chronological status audit trail for a complaint
 * @route   GET /api/complaints/:id/history
 * @access  Private (Owner, Admin, or Assigned Worker)
 */
const getComplaintHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await findComplaintByIdentifier(id);
  if (!complaint) {
    throw new ApiError(404, `Complaint #${id} could not be found.`);
  }

  // Authorization check
  const isOwner = complaint.citizen.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isAssignedWorker =
    complaint.assignedWorker &&
    complaint.assignedWorker.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isAssignedWorker) {
    throw new ApiError(
      403,
      'Forbidden: You are not authorized to view the history of this complaint.'
    );
  }

  const history = await ComplaintHistory.find({ complaint: complaint._id })
    .sort({ timestamp: 1 })
    .populate('changedBy', 'fullName role email');

  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

/**
 * @desc    Public complaint tracking by Complaint ID (e.g. CC-2026-0001) or Mongo ID
 * @route   GET /api/complaints/public/track/:identifier
 * @access  Public (No personal PII exposed)
 */
const trackComplaintPublic = asyncHandler(async (req, res) => {
  const rawIdentifier = req.params.identifier;

  if (!rawIdentifier || !rawIdentifier.trim()) {
    throw new ApiError(400, 'Complaint tracking ID is required.');
  }

  const identifier = rawIdentifier.trim();
  const complaint = await findComplaintByIdentifier(identifier);

  if (!complaint) {
    throw new ApiError(
      404,
      `No civic grievance found matching tracking ID: "${identifier}". Please verify the ID.`
    );
  }

  // Retrieve public audit timeline with populated actor details
  const historyRecords = await ComplaintHistory.find({ complaint: complaint._id })
    .sort({ timestamp: 1 })
    .populate('changedBy', 'fullName role');

  const timeline = historyRecords.map((item) => ({
    status: item.newStatus || item.status,
    note: item.remarks || '',
    timestamp: item.timestamp,
    actor: item.changedBy?.fullName
      ? `${item.changedBy.fullName} (${(item.changedBy.role || 'Municipal Desk').toUpperCase()})`
      : 'Municipal Desk',
  }));

  // Sanitize response: do NOT expose citizen phone or private user details
  res.status(200).json({
    success: true,
    data: {
      id: complaint._id,
      complaintId: complaint.complaintId,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      categoryLabel: complaint.categoryLabel || complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      ward: complaint.ward,
      location: complaint.location,
      landmark: complaint.landmark || '',
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      images: complaint.images || [],
      imageUrl: complaint.images?.[0] || '',
      resolutionPhotos: complaint.resolutionPhotos || [],
      resolutionNotes: complaint.resolutionNotes || '',
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      timeline,
      history: timeline,
    },
  });
});

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  getComplaintHistory,
  findComplaintByIdentifier,
  trackComplaintPublic,
};

