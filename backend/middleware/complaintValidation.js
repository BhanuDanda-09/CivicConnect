// ==============================================================================
// Complaint Validation Middleware (complaintValidation.js)
// ==============================================================================

const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

// Category constants matching schema
const VALID_CATEGORIES = [
  'pothole',
  'garbage',
  'water_leakage',
  'drainage',
  'street_light',
  'sanitation',
  'other',
  'ROADS_AND_POTHOLES',
  'GARBAGE_COLLECTION',
  'WATER_LEAKAGE',
  'DRAINAGE',
  'STREETLIGHTS',
  'PUBLIC_SANITATION',
  'OTHER',
];

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/**
 * Higher-order middleware to process express-validator results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new ApiError(400, errorDetails[0].message, errorDetails));
  }
  next();
};

/**
 * Validates citizen complaint creation
 */
const validateComplaintCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Complaint title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Complaint title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Detailed description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Civic category is required')
    .custom((val) => {
      if (!VALID_CATEGORIES.includes(val)) {
        throw new Error(
          `Invalid category '${val}'. Permitted categories: ${VALID_CATEGORIES.slice(0, 7).join(', ')}`
        );
      }
      return true;
    }),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location address is required')
    .isLength({ min: 3, max: 300 })
    .withMessage('Location address must be between 3 and 300 characters'),

  body('ward')
    .trim()
    .notEmpty()
    .withMessage('Municipal ward is required'),

  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  handleValidationErrors,
];

/**
 * Validates worker assignment by administrator
 */
const validateAssignWorker = [
  body('workerId')
    .trim()
    .notEmpty()
    .withMessage('Worker ID is required')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('workerId must be a valid MongoDB ObjectId');
      }
      return true;
    }),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Assignment remarks cannot exceed 500 characters'),

  handleValidationErrors,
];

/**
 * Validates complaint rejection by administrator
 */
const validateRejectComplaint = [
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is mandatory when rejecting a complaint')
    .isLength({ min: 5, max: 500 })
    .withMessage('Rejection reason must be between 5 and 500 characters'),

  handleValidationErrors,
];

/**
 * Validates complaint resolution by worker
 */
const validateResolveComplaint = [
  body('resolutionRemarks')
    .trim()
    .notEmpty()
    .withMessage('Resolution remarks describing remediation actions are required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Resolution remarks must be between 5 and 1000 characters'),

  handleValidationErrors,
];

/**
 * Validates administrative priority update
 */
const validatePriorityChange = [
  body('priority')
    .trim()
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  handleValidationErrors,
];

/**
 * Validates ObjectId in URL parameter
 */
const validateMongoIdParam = (paramName = 'id') => [
  param(paramName).custom((val) => {
    // Check if it's either a standard Mongo ObjectId or custom complaintId format (e.g. CC-2026-0001)
    if (mongoose.Types.ObjectId.isValid(val) || /^CC-\d{4}-\d+$/i.test(val)) {
      return true;
    }
    throw new Error(`Invalid identifier format for '${paramName}'`);
  }),
  handleValidationErrors,
];

module.exports = {
  validateComplaintCreation,
  validateAssignWorker,
  validateRejectComplaint,
  validateResolveComplaint,
  validatePriorityChange,
  validateMongoIdParam,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
};

