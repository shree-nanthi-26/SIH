const LearningResource = require('../models/LearningResource');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginate } = require('../utils/pagination');

/**
 * GET /api/v1/resources
 */
const getResources = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.skill) filter.skills = req.query.skill;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.source) filter.source = req.query.source;

  const total = await LearningResource.countDocuments(filter);
  const { skip, limit, meta } = paginate(req.query, total);
  const resources = await LearningResource.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('skills', 'name category')
    .sort('-createdAt');
  sendSuccess(res, 200, resources, meta);
});

/**
 * GET /api/v1/resources/:id
 */
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await LearningResource.findById(req.params.id).populate(
    'skills',
    'name category'
  );
  if (!resource) return sendError(res, 404, 'Resource not found');
  sendSuccess(res, 200, resource);
});

/**
 * POST /api/v1/resources
 */
const createResource = asyncHandler(async (req, res) => {
  const resource = await LearningResource.create(req.body);
  sendSuccess(res, 201, resource);
});

/**
 * PUT /api/v1/resources/:id
 */
const updateResource = asyncHandler(async (req, res) => {
  const resource = await LearningResource.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!resource) return sendError(res, 404, 'Resource not found');
  sendSuccess(res, 200, resource);
});

/**
 * DELETE /api/v1/resources/:id
 */
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await LearningResource.findByIdAndDelete(req.params.id);
  if (!resource) return sendError(res, 404, 'Resource not found');
  sendSuccess(res, 200, { message: 'Resource deleted' });
});

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};
