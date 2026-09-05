'use strict';

/**
 * NSSTA Mock Client
 *
 * Simulates the National Statistical Systems Training Academy (NSSTA)
 * Training Programme Advisory Committee (TPAC) recommended training catalog.
 *
 * Interface: { getCourses, getCourseById, recordCompletion, getCompletions }
 */

const mockCourses = [
  {
    id: 'NSSTA-001',
    title: 'Advanced Statistical Methods & Sampling Techniques',
    provider: 'NSSTA',
    category: 'Technical',
    durationDays: 5,
    mode: 'in-person',
    eligibility: 'ISS Officers & Senior Statisticians',
    language: 'English',
  },
  {
    id: 'NSSTA-002',
    title: 'Official Statistics & National Accounts Workshop',
    provider: 'NSSTA',
    category: 'Domain',
    durationDays: 3,
    mode: 'blended',
    eligibility: 'Officers working in Economic Statistics',
    language: 'English',
  },
  {
    id: 'NSSTA-003',
    title: 'Survey Operations & Field Data Quality Management',
    provider: 'NSSTA',
    category: 'Technical',
    durationDays: 4,
    mode: 'in-person',
    eligibility: 'Field Officers and Survey Supervisors',
    language: 'English',
  },
  {
    id: 'NSSTA-004',
    title: 'Executive Leadership & Public Policy for MoSPI',
    provider: 'NSSTA',
    category: 'Managerial',
    durationDays: 3,
    mode: 'in-person',
    eligibility: 'Directors & Joint Directors',
    language: 'English',
  },
  {
    id: 'NSSTA-005',
    title: 'Data Science & Big Data Applications in Governance',
    provider: 'NSSTA',
    category: 'Digital',
    durationDays: 5,
    mode: 'online',
    eligibility: 'All Statistical Officers',
    language: 'English',
  },
  {
    id: 'NSSTA-006',
    title: 'Price Index Compilation & Rebasing Methodology',
    provider: 'NSSTA',
    category: 'Domain',
    durationDays: 2,
    mode: 'blended',
    eligibility: 'Price Statistics Division Officers',
    language: 'Hindi',
  },
];

const mockCompletions = [
  {
    id: 'NSSTA-COMP-001',
    officerId: 'sample-officer-1',
    courseId: 'NSSTA-001',
    completedAt: '2026-05-10T11:00:00Z',
    score: 88,
    certificate: true,
  },
];

/**
 * Get paginated NSSTA course catalog with optional filters.
 * @param {{ category?: string, mode?: string, search?: string, skip?: number, limit?: number }} query
 * @returns {{ courses: object[], total: number }}
 */
const getCourses = (query = {}) => {
  let filtered = [...mockCourses];
  if (query.category) {
    filtered = filtered.filter((c) => c.category.toLowerCase() === query.category.toLowerCase());
  }
  if (query.mode) {
    filtered = filtered.filter((c) => c.mode.toLowerCase() === query.mode.toLowerCase());
  }
  if (query.search) {
    const q = query.search.toLowerCase();
    filtered = filtered.filter(
      (c) => c.title.toLowerCase().includes(q) || c.eligibility.toLowerCase().includes(q)
    );
  }
  const skip = query.skip || 0;
  const limit = query.limit || 20;
  return { courses: filtered.slice(skip, skip + limit), total: filtered.length };
};

/**
 * Get a single NSSTA course by ID.
 * @param {string} id
 * @returns {object|null}
 */
const getCourseById = (id) => mockCourses.find((c) => c.id === id) || null;

/**
 * Record an NSSTA course completion event and update competency profile.
 * @param {{ officerId: string, courseId: string, score?: number }} data
 * @returns {Promise<object>} The created completion record
 */
const recordCompletion = async (data) => {
  const { officerId, courseId, score } = data;
  const completion = {
    id: `NSSTA-COMP-${Date.now()}`,
    officerId,
    courseId,
    completedAt: new Date().toISOString(),
    score: score || 0,
    certificate: (score || 0) >= 60,
  };
  mockCompletions.push(completion);

  try {
    const { applyCompletionToProfile } = require('./competencyUpdateService');
    await applyCompletionToProfile(officerId, courseId, score || 0, 'nssta');
  } catch (err) {
    console.warn('[nsstaMockClient] competency update skipped:', err.message);
  }

  return completion;
};

/**
 * Get NSSTA completion records filtered by officerId.
 * @param {{ officerId?: string }} query
 * @returns {object[]}
 */
const getCompletions = (query = {}) => {
  let filtered = [...mockCompletions];
  if (query.officerId) {
    filtered = filtered.filter((c) => c.officerId === query.officerId);
  }
  return filtered;
};

module.exports = { getCourses, getCourseById, recordCompletion, getCompletions };
