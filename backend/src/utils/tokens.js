'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a short-lived JWT access token.
 * @param {string} id - User ObjectId string
 * @returns {string} Signed JWT
 */
const generateAccessToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });

/**
 * Generate a long-lived JWT refresh token.
 * @param {string} id - User ObjectId string
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (id) =>
  jwt.sign({ id }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpire });

module.exports = { generateAccessToken, generateRefreshToken };
