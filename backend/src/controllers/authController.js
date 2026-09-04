const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const OfficerProfile = require('../models/OfficerProfile');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate JWT access token.
 * @param {string} id - User ID
 * @returns {string}
 */
const generateAccessToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });

/**
 * Generate JWT refresh token.
 * @param {string} id - User ID
 * @returns {string}
 */
const generateRefreshToken = (id) =>
  jwt.sign({ id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  });

/**
 * POST /api/v1/auth/register
 * Register a new user (defaults to 'officer' role).
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, department, designation } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 409, 'Email already registered', 'DUPLICATE_EMAIL');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'officer',
    department,
    designation,
  });

  // Auto-create an officer profile for officer users
  if (user.role === 'officer') {
    await OfficerProfile.create({ user: user._id, currentSkills: [] });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 201, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
    },
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
    },
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/v1/auth/refresh-token
 */
const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 400, 'Refresh token is required');
  }

  const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    return sendError(res, 401, 'Invalid refresh token', 'INVALID_REFRESH');
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save({ validateBeforeSave: false });
  sendSuccess(res, 200, { message: 'Logged out successfully' });
});

/**
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user });
});

module.exports = { register, login, refreshTokenHandler, logout, getMe };
