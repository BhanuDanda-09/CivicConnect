// ==============================================================================
// Field Worker Analytics Controller (workerAnalyticsController.js)
// Personal metrics, SLA compliance, and assigned task location mapping
// ==============================================================================

const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get personal work order metrics and recent tasks for authenticated worker
 * @route   GET /api/workers/analytics/overview
 * @access  Private (Worker only)
 */
const getWorkerOverview = asyncHandler(async (req, res) => {
  const workerId = req.user._id;

  const [
    totalAssigned,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    urgentTasks,
    highPriorityTasks,
    recentTasks,
  ] = await Promise.all([
    Complaint.countDocuments({ assignedWorker: workerId }),
    Complaint.countDocuments({ assignedWorker: workerId, status: 'ASSIGNED' }),
    Complaint.countDocuments({ assignedWorker: workerId, status: 'IN_PROGRESS' }),
    Complaint.countDocuments({
      assignedWorker: workerId,
      status: { $in: ['RESOLVED', 'CITIZEN_FEEDBACK'] },
    }),
    Complaint.countDocuments({
      assignedWorker: workerId,
      priority: 'EMERGENCY',
      status: { $nin: ['RESOLVED', 'CITIZEN_FEEDBACK', 'REJECTED'] },
    }),
    Complaint.countDocuments({
      assignedWorker: workerId,
      priority: 'HIGH',
      status: { $nin: ['RESOLVED', 'CITIZEN_FEEDBACK', 'REJECTED'] },
    }),
    Complaint.find({ assignedWorker: workerId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(6)
      .populate('citizen', 'fullName mobileNumber address'),
  ]);

  const completionRate =
    totalAssigned > 0 ? Math.round((completedTasks / totalAssigned) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      worker: {
        id: req.user._id.toString(),
        name: req.user.fullName,
        email: req.user.email,
        phone: req.user.mobileNumber,
        trade: req.user.trade || 'Roads & Public Infrastructure',
        ward: req.user.ward || 'Ward 1 - Central Market & Bus Terminal',
        rating: 4.9,
      },
      summary: {
        totalAssigned,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        urgent: urgentTasks,
        highPriority: highPriorityTasks,
        completionRate,
      },
      recentTasks: recentTasks.map((t) => ({
        id: t._id.toString(),
        complaintId: t.complaintId,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        ward: t.ward,
        location: t.location,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        citizenName: t.citizen?.fullName || 'Citizen',
        citizenPhone: t.citizen?.mobileNumber || '',
        imageUrl: t.imageUrl || '',
      })),
    },
  });
});

/**
 * @desc    Get geographic coordinates of work orders assigned to authenticated worker
 * @route   GET /api/workers/analytics/task-locations
 * @access  Private (Worker only)
 */
const getWorkerTaskLocations = asyncHandler(async (req, res) => {
  const workerId = req.user._id;
  const { status } = req.query;

  const filter = { assignedWorker: workerId };
  if (status) {
    filter.status = status;
  } else {
    // By default, exclude rejected tasks
    filter.status = { $ne: 'REJECTED' };
  }

  const tasks = await Complaint.find(filter)
    .select('complaintId title category priority status ward state district city location country latitude longitude locationGeo createdAt citizen')
    .populate('citizen', 'fullName mobileNumber')
    .sort({ priority: 1, createdAt: -1 });

  const locations = tasks.map((t) => {
    const lat = t.latitude || (t.locationGeo?.coordinates ? t.locationGeo.coordinates[1] : 20.5937);
    const lng = t.longitude || (t.locationGeo?.coordinates ? t.locationGeo.coordinates[0] : 78.9629);

    return {
      id: t._id.toString(),
      complaintId: t.complaintId,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      ward: t.ward,
      state: t.state || '',
      district: t.district || '',
      city: t.city || '',
      country: t.country || 'India',
      address: t.location,
      lat,
      lng,
      coordinates: [lat, lng],
      createdAt: t.createdAt,
      citizenName: t.citizen?.fullName || 'Citizen',
      citizenPhone: t.citizen?.mobileNumber || '',
    };
  });

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations,
  });
});

module.exports = {
  getWorkerOverview,
  getWorkerTaskLocations,
};

