// ==============================================================================
// Notification Model (Mongoose Schema)
// ==============================================================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['STATUS_UPDATE', 'ASSIGNMENT', 'VERIFICATION', 'FEEDBACK_REQUEST', 'SYSTEM'],
      default: 'STATUS_UPDATE',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

