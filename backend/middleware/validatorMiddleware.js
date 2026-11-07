// ==============================================================================
// Input Validation Middleware (express-validator)
// ==============================================================================

const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validates request and throws ApiError if validation issues exist
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    const message = extractedErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new ApiError(400, `Validation Error: ${message}`, extractedErrors);
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters long'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\+?[0-9\s-]{10,15}$/)
    .withMessage('Please provide a valid 10-15 digit mobile number'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Residential address is required'),

  body('ward')
    .optional()
    .trim(),

  body('role')
    .optional()
    .isIn(['citizen', 'admin', 'worker', 'CITIZEN', 'ADMIN', 'WORKER'])
    .withMessage('Role must be citizen, admin, or worker'),

  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors,
};

