const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { sendError } = require('../utils/response');
const User = require('../models/User');

/**
 * Verify JWT access token and attach user to req.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Not authorized — no token provided', 'NO_TOKEN');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User no longer exists', 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-based guard. Must be used AFTER `protect`.
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'officer')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(
      res,
      403,
      `Role '${req.user.role}' is not authorized for this route`,
      'FORBIDDEN'
    );
  }
  next();
};

module.exports = { protect, authorize };
