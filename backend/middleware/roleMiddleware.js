// ==============================================================================
// Role-Based Access Control Middleware (roleMiddleware.js)
// ==============================================================================

const ApiError = require('../utils/ApiError');

/**
 * Restricts access to specific roles (case-insensitive)
 * @param  {...string} roles - Permitted roles (e.g. 'ADMIN', 'WORKER', 'CITIZEN')
 */
const authorize = (...roles) => {
  const normalizedAllowedRoles = roles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    // 1. Ensure user is authenticated
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: Please authenticate to access this endpoint.');
    }

    const userRole = (req.user.role || '').toLowerCase();

    // 2. Check if verified user role is allowed
    if (!normalizedAllowedRoles.includes(userRole)) {
      throw new ApiError(
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}`
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
