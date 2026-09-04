const { sendError } = require('../utils/response');

/**
 * Custom application error with HTTP status code.
 */
class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} [code] - Machine-readable error code
   */
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps an async route handler to catch rejected promises.
 * @param {Function} fn - Async express handler
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, messages.join('. '), 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return sendError(
      res,
      409,
      `Duplicate value for field(s): ${field}`,
      'DUPLICATE_KEY'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', 'TOKEN_EXPIRED');
  }

  // Operational errors we threw intentionally
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.code);
  }

  // Unknown / programming errors
  console.error('💥 Unexpected error:', err);
  return sendError(
    res,
    500,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    'INTERNAL_ERROR'
  );
};

module.exports = { AppError, asyncHandler, errorHandler };
