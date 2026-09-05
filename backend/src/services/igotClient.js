'use strict';

/**
 * iGOT Client — interface-shaped export.
 *
 * Reads IGOT_MODE from environment:
 *   - 'mock'  → delegates to igotMockClient (default, suitable for hackathon prototype)
 *   - 'live'  → throws a clear "not implemented" error; swap in a real HTTP client here
 *               when NIC/iGOT production credentials are available.
 *
 * Interface: { getCourses, getCourseById, recordCompletion, getCompletions }
 *
 * === To integrate with a real iGOT API ===
 * 1. Set IGOT_MODE=live in backend/.env
 * 2. Replace the stub methods below with real HTTP calls to the iGOT API base URL.
 * 3. Map iGOT response fields to the same shape returned by igotMockClient so
 *    igotMock.js routes need zero changes.
 */

const config = require('../config/env');

const NOT_IMPLEMENTED = () => {
  throw new Error('iGOT live client not implemented — provide real client or set IGOT_MODE=mock');
};

const liveClient = {
  getCourses: NOT_IMPLEMENTED,
  getCourseById: NOT_IMPLEMENTED,
  recordCompletion: NOT_IMPLEMENTED,
  getCompletions: NOT_IMPLEMENTED,
};

const client = config.igotMode === 'live' ? liveClient : require('./igotMockClient');

module.exports = client;
