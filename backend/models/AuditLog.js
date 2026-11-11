// ==============================================================================
// System Security & Administrative Audit Log Model (AuditLog.js)
// Immutable audit trail for administrative governance actions and compliance
// ==============================================================================

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action identifier is required'],
      trim: true,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who performed action is required'],
      index: true,
    },
    performedByRole: {
      type: String,
      default: 'admin',
      trim: true,
    },
    targetEntity: {
      type: String,
      required: [true, 'Target entity is required'],
      enum: ['Complaint', 'Asset', 'User', 'System'],
      index: true,
    },
    targetId: {
      type: String,
      required: [true, 'Target identifier is required'],
      trim: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable: only createdAt
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

