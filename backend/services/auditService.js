// ==============================================================================
// Audit Log Recording Service (auditService.js)
// Asynchronous logging helper for administrative security & governance operations
// ==============================================================================

const AuditLog = require('../models/AuditLog');

/**
 * Records an immutable audit log entry for administrative or security actions
 * @param {Object} params
 * @param {string} params.action - e.g. 'VERIFY_COMPLAINT', 'REJECT_COMPLAINT', 'ASSIGN_WORKER', 'UPDATE_PRIORITY'
 * @param {Object} params.performedBy - User object or user ID
 * @param {string} [params.performedByRole] - 'admin' | 'worker' | 'system'
 * @param {string} params.targetEntity - 'Complaint' | 'Asset' | 'User' | 'System'
 * @param {string} params.targetId - ID or complaint tracking ID
 * @param {Object} [params.details] - Additional contextual details
 * @param {Object} [params.req] - Express request object for IP and User-Agent
 */
async function recordAudit({
  action,
  performedBy,
  performedByRole = 'admin',
  targetEntity,
  targetId,
  details = {},
  req = null,
}) {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';

    const userAgent = req?.headers['user-agent'] || 'system';

    const userId = performedBy?._id || performedBy;

    await AuditLog.create({
      action,
      performedBy: userId,
      performedByRole: performedBy?.role || performedByRole,
      targetEntity,
      targetId: String(targetId),
      details,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Audit failures should be logged but never block transactional workflows
    console.error('[AuditService Error] Failed to write audit record:', err.message);
  }
}

module.exports = {
  recordAudit,
};

