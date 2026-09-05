'use strict';

/**
 * NSSTA Client — interface-shaped export.
 *
 * Reads NSSTA_MODE from environment:
 *   - 'mock'  → delegates to nsstaMockClient (default, suitable for hackathon prototype)
 *   - 'live'  → throws a clear "not implemented" error; swap in a real HTTP client here
 *               when NSSTA API credentials/endpoints are available.
 *
 * Interface: { getCourses, getCourseById, recordCompletion, getCompletions }
 */

const config = require('../config/env');

const NOT_IMPLEMENTED = () => {
  throw new Error('NSSTA live client not implemented — provide real client or set NSSTA_MODE=mock');
};

const liveClient = {
  getCourses: NOT_IMPLEMENTED,
  getCourseById: NOT_IMPLEMENTED,
  recordCompletion: NOT_IMPLEMENTED,
  getCompletions: NOT_IMPLEMENTED,
};

const client = config.nsstaMode === 'live' ? liveClient : require('./nsstaMockClient');

module.exports = client;
