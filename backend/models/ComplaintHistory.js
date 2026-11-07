// ==============================================================================
// Complaint History Audit Trail Model (Mongoose Schema)
// ==============================================================================

const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      index: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, 'New status is required'],
      enum: [
        'SUBMITTED',
        'UNDER_VERIFICATION',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CITIZEN_FEEDBACK',
        'REJECTED',
      ],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who changed status is required'],
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Explicit timestamp field used above
  }
);

const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);

module.exports = ComplaintHistory;

