// ==============================================================================
// Real-Time Notification Controller (notificationController.js)
// Persisted alerts, unread counts, and real-time Socket.IO dispatch
// ==============================================================================

const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { emitToUser, emitToRole } = require('../services/socketService');

/**
 * Creates and persists a notification in MongoDB, then dispatches real-time event
 * @param {Object} options
 * @param {string|mongoose.Types.ObjectId} options.recipient - Target User ID
 * @param {string} options.title - Alert Title
 * @param {string} options.message - Alert Description
 * @param {string} [options.type='STATUS_UPDATE'] - Event type
 * @param {string|mongoose.Types.ObjectId} [options.relatedComplaint=null]
 * @returns {Promise<Notification>}
 */
const createAndDispatchNotification = async ({
  recipient,
  title,
  message,
  type = 'STATUS_UPDATE',
  relatedComplaint = null,
}) => {
  if (!recipient) return null;

  // In offline unit test mode without live DB connection, do not buffer queries
  if (mongoose.connection.readyState !== 1) {
    emitToUser(recipient, 'notification:received', {
      recipient,
      title,
      message,
      type,
      relatedComplaint,
      createdAt: new Date(),
    });
    return null;
  }

  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedComplaint,
      isRead: false,
    });

    // Populate related complaint metadata if present
    if (relatedComplaint) {
      await notification.populate('relatedComplaint', 'complaintId title category priority status ward');
    }

    // 1. Emit direct real-time notification to user's private socket room
    emitToUser(recipient, 'notification:received', notification);

    // 2. Compute and emit fresh unread count
    const unreadCount = await Notification.countDocuments({
      recipient,
      isRead: false,
    });
    emitToUser(recipient, 'notification:count', { unreadCount });

    return notification;
  } catch (err) {
    console.warn('[Notification Error] Could not create notification:', err.message);
    return null;
  }
};

/**
 * Broadcasts a system/administrative alert to all users with a specific role
 * @param {'admin'|'worker'|'citizen'} role
 * @param {Object} payload
 */
const dispatchRoleAlert = (role, event, payload) => {
  emitToRole(role, event, payload);
};

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;

  const filter = { recipient: req.user._id };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('relatedComplaint', 'complaintId title category priority status ward'),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    total,
    count: notifications.length,
    unreadCount,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: notifications,
  });
});

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, `Notification #${id} could not be found.`);
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  // Emit updated count to socket
  emitToUser(req.user._id, 'notification:count', { unreadCount });

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
    unreadCount,
  });
});

/**
 * @desc    Mark all unread notifications for the user as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  emitToUser(req.user._id, 'notification:count', { unreadCount: 0 });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    unreadCount: 0,
  });
});

module.exports = {
  createAndDispatchNotification,
  dispatchRoleAlert,
  getNotifications,
  markAsRead,
  markAllAsRead,
};

