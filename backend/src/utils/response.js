/**
 * Standard API response envelope.
 * Every endpoint uses this to ensure consistent JSON shape.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {*} data
 * @param {object} [meta] - Pagination or extra metadata.
 */
const sendSuccess = (res, statusCode, data, meta = undefined) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {string} [code] - Optional machine-readable error code.
 */
const sendError = (res, statusCode, message, code = undefined) => {
  const body = {
    success: false,
    error: { message },
  };
  if (code) body.error.code = code;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
