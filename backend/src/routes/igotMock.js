/**
 * iGOT Karmayogi Route Handler
 *
 * All business logic lives in igotClient.js (selected by IGOT_MODE env var).
 * These routes are thin HTTP shells: parse request → call client → send response.
 *
 * Route paths and response envelope shapes are intentionally unchanged so that
 * frontend calls and downstream services need no modification.
 */
const express = require('express');
const { sendSuccess, sendError } = require('../utils/response');
const { paginate } = require('../utils/pagination');
const igot = require('../services/igotClient');

const router = express.Router();

/**
 * GET /api/v1/igot/courses
 * Paginated course catalog with optional category/search filters.
 */
router.get('/courses', (req, res) => {
  const { skip, limit, meta } = paginate(req.query, 0); // total computed after filter
  const { courses, total } = igot.getCourses({
    category: req.query.category,
    search: req.query.search,
    skip,
    limit,
  });
  // Re-compute meta with real total
  const { meta: realMeta } = paginate(req.query, total);
  sendSuccess(res, 200, courses, realMeta);
});

/**
 * GET /api/v1/igot/courses/:id
 */
router.get('/courses/:id', (req, res) => {
  const course = igot.getCourseById(req.params.id);
  if (!course) return sendError(res, 404, 'Course not found');
  sendSuccess(res, 200, course);
});

/**
 * POST /api/v1/igot/completions
 * Record a completion event and trigger competency score update.
 */
router.post('/completions', async (req, res) => {
  const { officerId, courseId, score } = req.body;
  if (!officerId || !courseId) {
    return sendError(res, 400, 'officerId and courseId are required');
  }
  const completion = await igot.recordCompletion({ officerId, courseId, score });
  sendSuccess(res, 201, completion);
});

/**
 * GET /api/v1/igot/completions?officerId=
 */
router.get('/completions', (req, res) => {
  const completions = igot.getCompletions({ officerId: req.query.officerId });
  sendSuccess(res, 200, completions);
});

module.exports = router;

