// ==============================================================================
// Admin Municipal Worker Management Controller (adminWorkerController.js)
// ==============================================================================

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all municipal field workers with active workload & completion metrics
 * @route   GET /api/admin/workers
 * @access  Private (Admin only)
 */
const getWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'worker' }).sort({ createdAt: -1 });

  // Compute live active & completed task counts for each worker
  const workersWithWorkload = await Promise.all(
    workers.map(async (worker) => {
      const [activeTasks, completedTasks] = await Promise.all([
        Complaint.countDocuments({
          assignedWorker: worker._id,
          status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
        }),
        Complaint.countDocuments({
          assignedWorker: worker._id,
          status: { $in: ['RESOLVED', 'CITIZEN_FEEDBACK'] },
        }),
      ]);

      const workerObj = worker.toJSON();
      return {
        ...workerObj,
        id: worker._id.toString(),
        name: worker.fullName,
        phone: worker.mobileNumber,
        assignedZone: worker.ward || 'Ward 1 - Central Market & Bus Terminal',
        trade: worker.trade || 'Roads & Public Infrastructure',
        activeTasks,
        completedTasks,
        rating: 4.9,
        status: !worker.isActive ? 'Inactive' : activeTasks >= 5 ? 'Busy' : 'Available',
      };
    })
  );

  res.status(200).json({
    success: true,
    count: workersWithWorkload.length,
    data: workersWithWorkload,
  });
});

/**
 * @desc    Register a new municipal field worker
 * @route   POST /api/admin/workers
 * @access  Private (Admin only)
 */
const createWorker = asyncHandler(async (req, res) => {
  const {
    name,
    fullName,
    email,
    phone,
    mobileNumber,
    trade,
    assignedZone,
    ward,
    password,
  } = req.body;

  const workerName = fullName || name;
  const workerPhone = mobileNumber || phone;
  const workerWard = ward || assignedZone || 'Ward 1 - Central Market & Bus Terminal';

  if (!workerName || !workerName.trim()) {
    throw new ApiError(400, 'Worker full name is required');
  }

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Worker official email address is required');
  }

  // Check email uniqueness
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, `A user with email '${email}' already exists in the registry.`);
  }

  const worker = new User({
    fullName: workerName.trim(),
    email: email.toLowerCase().trim(),
    password: password || 'Worker@12345',
    mobileNumber: workerPhone ? workerPhone.trim() : '+91 98000 00000',
    address: workerWard,
    ward: workerWard,
    trade: trade || 'Roads & Public Infrastructure',
    role: 'worker',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  });

  await worker.save();

  res.status(201).json({
    success: true,
    message: `Municipal field worker ${worker.fullName} registered successfully.`,
    data: {
      id: worker._id.toString(),
      name: worker.fullName,
      email: worker.email,
      phone: worker.mobileNumber,
      trade: worker.trade,
      assignedZone: worker.ward,
      activeTasks: 0,
      completedTasks: 0,
      rating: 5.0,
      status: 'Available',
    },
  });
});

module.exports = {
  getWorkers,
  createWorker,
};
