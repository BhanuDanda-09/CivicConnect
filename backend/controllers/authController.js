// ==============================================================================
// Authentication Controller (authController.js)
// ==============================================================================

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenResponse } = require('../utils/tokenUtils');

/**
 * @route   POST /api/auth/register
 * @desc    Public registration for Citizens (always assigns CITIZEN role)
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    mobileNumber,
    address,
    houseNumber,
    street,
    landmark,
    city,
    district,
    state,
    pincode,
    country,
    ward,
  } = req.body;

  // 1. Check for existing user with normalized email
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists. Please sign in instead.');
  }

  // 2. Validate & format Indian address
  let fullAddress = address ? address.trim() : '';
  if (!fullAddress) {
    const addressComponents = [
      houseNumber,
      street,
      landmark ? `Near ${landmark}` : null,
      city,
      district,
      state,
      pincode ? `PIN: ${pincode}` : null,
    ].filter(Boolean);
    fullAddress = addressComponents.join(', ');
  }

  if (!fullAddress) {
    throw new ApiError(400, 'Residential address is required. Please provide your locality or state/district.');
  }

  // 3. Strict Security: Enforce citizen role for all public registrations
  // ADMIN and WORKER roles cannot be created via public registration
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password, // Hashed automatically by pre-save hook in User model
    mobileNumber: mobileNumber.trim(),
    address: fullAddress,
    houseNumber: houseNumber ? houseNumber.trim() : '',
    street: street ? street.trim() : '',
    landmark: landmark ? landmark.trim() : '',
    city: city ? city.trim() : '',
    district: district ? district.trim() : '',
    state: state ? state.trim() : '',
    pincode: pincode ? pincode.trim() : '',
    country: country ? country.trim() : 'India',
    ward: ward ? ward.trim() : 'Ward 1 - Central Market & Bus Terminal',
    role: 'citizen', // Enforced role
    isActive: true,
  });

  // 4. Issue token and return sanitized user response
  sendTokenResponse(user, 201, res, 'Citizen account registered successfully.');
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token with role
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password.');
  }

  // 1. Find user by normalized email and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // Generic invalid-credentials error to prevent user enumeration
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // 2. Verify account status
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact municipal support.');
  }

  // 3. Compare passwords using bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // 4. Issue JWT and send response
  sendTokenResponse(user, 200, res, `Welcome back, ${user.fullName}!`);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (Requires valid JWT)
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the 'protect' middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user & clear cookie / inform client to purge token
 * @access  Public / Private
 */
const logout = asyncHandler(async (req, res) => {
  // Clear HTTP cookie if cookie-based session is in use
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully. Client storage cleared.',
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
