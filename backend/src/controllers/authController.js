const jwt = require('jsonwebtoken');
const { paginate } = require('../utils/pagination');
const config = require('../config/env');
const User = require('../models/User');
const OfficerProfile = require('../models/OfficerProfile');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');



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

/**
 * GET /api/v1/users
 * Admin-only: list all users with optional role filter and pagination.
 */
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.department) filter.department = new RegExp(req.query.department, 'i');

  const total = await User.countDocuments(filter);
  const { skip, limit, meta } = paginate(req.query, total);

  const users = await User.find(filter)
    .select('-password -refreshToken')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  sendSuccess(res, 200, users, meta);
});

module.exports = { register, login, refreshTokenHandler, logout, getMe, getUsers };
