'use strict';

/**
 * NSSTA TPAC Training Programme Route Handler
 *
 * All business logic lives in nsstaClient.js (selected by NSSTA_MODE env var).
 * Thin HTTP shells: parse request → call client → send response.
 */
const express = require('express');
const { sendSuccess, sendError } = require('../utils/response');
const { paginate } = require('../utils/pagination');
const nssta = require('../services/nsstaClient');

const router = express.Router();

/**
 * GET /api/v1/nssta/courses
 * Paginated NSSTA course catalog with optional category/mode/search filters.
 */
router.get('/courses', (req, res) => {
  const { skip, limit } = paginate(req.query, 0);
  const { courses, total } = nssta.getCourses({
    category: req.query.category,
    mode: req.query.mode,
    search: req.query.search,
    skip,
    limit,
  });
  const { meta } = paginate(req.query, total);
  sendSuccess(res, 200, courses, meta);
});

/**
 * GET /api/v1/nssta/courses/:id
 */
router.get('/courses/:id', (req, res) => {
  const course = nssta.getCourseById(req.params.id);
  if (!course) return sendError(res, 404, 'NSSTA course not found');
  sendSuccess(res, 200, course);
});

/**
 * POST /api/v1/nssta/completions
 * Record a completion event and trigger competency score update.
 */
router.post('/completions', async (req, res) => {
  const { officerId, courseId, score } = req.body;
  if (!officerId || !courseId) {
    return sendError(res, 400, 'officerId and courseId are required');
  }
  const completion = await nssta.recordCompletion({ officerId, courseId, score });
  sendSuccess(res, 201, completion);
});

/**
 * GET /api/v1/nssta/completions?officerId=
 */
router.get('/completions', (req, res) => {
  const completions = nssta.getCompletions({ officerId: req.query.officerId });
  sendSuccess(res, 200, completions);
});

module.exports = router;
