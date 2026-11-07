// ==============================================================================
// Admin User Directory Controller (adminUserController.js)
// ==============================================================================

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users (Citizens, Workers, Admins) with complaint statistics and filters
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, role, status } = req.query;

  const filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { address: searchRegex },
      { ward: searchRegex },
    ];
  }

  if (role && role !== 'ALL') {
    filter.role = role.toLowerCase();
  }

  if (status && status !== 'ALL') {
    filter.isActive = status === 'Active';
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  // Compute complaint counts for users
  const enrichedUsers = await Promise.all(
    users.map(async (u) => {
      let complaintsFiled = 0;
      if (u.role === 'citizen') {
        complaintsFiled = await Complaint.countDocuments({ citizen: u._id });
      } else if (u.role === 'worker') {
        complaintsFiled = await Complaint.countDocuments({ assignedWorker: u._id });
      }

      return {
        id: u._id.toString(),
        name: u.fullName,
        email: u.email,
        phone: u.mobileNumber,
        role: u.role,
        address: u.address || u.ward,
        ward: u.ward,
        trade: u.trade,
        isActive: u.isActive,
        status: u.isActive ? 'Active' : 'Inactive',
        complaintsFiled,
        createdAt: u.createdAt,
      };
    })
  );

  res.status(200).json({
    success: true,
    total,
    count: enrichedUsers.length,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: enrichedUsers,
  });
});

/**
 * @desc    Toggle activation status of a user (deactivate/reactivate)
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @access  Private (Admin only)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, `User #${id} could not be found.`);
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Security Guard: Administrators cannot deactivate their own active account.');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User account '${user.fullName}' has been ${user.isActive ? 'activated' : 'deactivated'}.`,
    data: {
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      status: user.isActive ? 'Active' : 'Inactive',
    },
  });
});

module.exports = {
  getAllUsers,
  toggleUserStatus,
};
