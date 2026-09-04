/**
 * iGOT Karmayogi Mock Adapter
 *
 * Simulates the iGOT course catalog and completion record APIs.
 * Switch between mock and real via IGOT_BASE_URL env var.
 */
const express = require('express');
const { sendSuccess, sendError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

const router = express.Router();

// ─── In-memory mock data ────────────────────────────────────────────
const mockCourses = [
  { id: 'IGOT-001', title: 'Introduction to Official Statistics', provider: 'MoSPI', category: 'Foundation', durationHours: 8, modules: 6, language: 'English' },
  { id: 'IGOT-002', title: 'Survey Methodology & Sampling', provider: 'NSSO', category: 'Technical', durationHours: 12, modules: 8, language: 'English' },
  { id: 'IGOT-003', title: 'National Accounts Framework', provider: 'CSO', category: 'Domain', durationHours: 16, modules: 10, language: 'English' },
  { id: 'IGOT-004', title: 'Data Visualization for Government', provider: 'NIC', category: 'Digital', durationHours: 6, modules: 4, language: 'English' },
  { id: 'IGOT-005', title: 'R Programming for Statistics', provider: 'ISI', category: 'Technical', durationHours: 20, modules: 12, language: 'English' },
  { id: 'IGOT-006', title: 'Python for Data Analysis', provider: 'ISI', category: 'Technical', durationHours: 20, modules: 12, language: 'English' },
  { id: 'IGOT-007', title: 'Census Operations Management', provider: 'RGI', category: 'Domain', durationHours: 10, modules: 7, language: 'Hindi' },
  { id: 'IGOT-008', title: 'Consumer Price Index Compilation', provider: 'CSO', category: 'Domain', durationHours: 8, modules: 5, language: 'English' },
  { id: 'IGOT-009', title: 'Report Writing for Policymakers', provider: 'LBSNAA', category: 'Communication', durationHours: 4, modules: 3, language: 'English' },
  { id: 'IGOT-010', title: 'Team Leadership in Government', provider: 'LBSNAA', category: 'Managerial', durationHours: 6, modules: 4, language: 'English' },
  { id: 'IGOT-011', title: 'Data Privacy & Security', provider: 'MeitY', category: 'Digital', durationHours: 4, modules: 3, language: 'English' },
  { id: 'IGOT-012', title: 'GIS & Spatial Data Analysis', provider: 'SoI', category: 'Digital', durationHours: 12, modules: 8, language: 'English' },
  { id: 'IGOT-013', title: 'Time Series & Forecasting Methods', provider: 'ISI', category: 'Analytical', durationHours: 14, modules: 9, language: 'English' },
  { id: 'IGOT-014', title: 'Machine Learning for Government', provider: 'IIT Delhi', category: 'Analytical', durationHours: 24, modules: 15, language: 'English' },
  { id: 'IGOT-015', title: 'SQL for Data Management', provider: 'NIC', category: 'Digital', durationHours: 8, modules: 6, language: 'English' },
  { id: 'IGOT-016', title: 'Presentation Skills Workshop', provider: 'LBSNAA', category: 'Communication', durationHours: 3, modules: 2, language: 'English' },
  { id: 'IGOT-017', title: 'Project Management Essentials', provider: 'ISTM', category: 'Managerial', durationHours: 8, modules: 5, language: 'English' },
  { id: 'IGOT-018', title: 'Ethics in Public Administration', provider: 'LBSNAA', category: 'Foundation', durationHours: 4, modules: 3, language: 'Hindi' },
  { id: 'IGOT-019', title: 'Big Data Analytics for Government', provider: 'NIC', category: 'Technical', durationHours: 18, modules: 11, language: 'English' },
  { id: 'IGOT-020', title: 'Economic Survey Analysis', provider: 'DEA', category: 'Domain', durationHours: 10, modules: 6, language: 'English' },
];

const mockCompletions = [
  { id: 'COMP-001', officerId: 'sample-officer-1', courseId: 'IGOT-001', completedAt: '2026-06-15T10:00:00Z', score: 85, certificate: true },
  { id: 'COMP-002', officerId: 'sample-officer-1', courseId: 'IGOT-004', completedAt: '2026-07-20T14:30:00Z', score: 72, certificate: true },
  { id: 'COMP-003', officerId: 'sample-officer-2', courseId: 'IGOT-002', completedAt: '2026-08-01T09:00:00Z', score: 91, certificate: true },
];

// ─── Routes ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/igot/courses
 * Paginated course catalog.
 */
router.get('/courses', (req, res) => {
  let filtered = [...mockCourses];

  if (req.query.category) {
    filtered = filtered.filter(
      (c) => c.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    filtered = filtered.filter((c) => c.title.toLowerCase().includes(q));
  }

  const { skip, limit, meta } = paginate(req.query, filtered.length);
  const page = filtered.slice(skip, skip + limit);
  sendSuccess(res, 200, page, meta);
});

/**
 * GET /api/v1/igot/courses/:id
 */
router.get('/courses/:id', (req, res) => {
  const course = mockCourses.find((c) => c.id === req.params.id);
  if (!course) return sendError(res, 404, 'Course not found');
  sendSuccess(res, 200, course);
});

/**
 * POST /api/v1/igot/completions
 * Record a completion event.
 */
router.post('/completions', (req, res) => {
  const { officerId, courseId, score } = req.body;
  if (!officerId || !courseId) {
    return sendError(res, 400, 'officerId and courseId are required');
  }
  const completion = {
    id: `COMP-${Date.now()}`,
    officerId,
    courseId,
    completedAt: new Date().toISOString(),
    score: score || 0,
    certificate: (score || 0) >= 60,
  };
  mockCompletions.push(completion);
  sendSuccess(res, 201, completion);
});

/**
 * GET /api/v1/igot/completions?officerId=
 */
router.get('/completions', (req, res) => {
  let filtered = [...mockCompletions];
  if (req.query.officerId) {
    filtered = filtered.filter((c) => c.officerId === req.query.officerId);
  }
  sendSuccess(res, 200, filtered);
});

module.exports = router;
