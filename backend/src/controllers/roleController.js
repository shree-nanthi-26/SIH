const RoleProfile = require('../models/RoleProfile');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginate } = require('../utils/pagination');

/**
 * GET /api/v1/roles
 */
const getRoles = asyncHandler(async (req, res) => {
  const total = await RoleProfile.countDocuments();
  const { skip, limit, meta } = paginate(req.query, total);
  const roles = await RoleProfile.find()
    .skip(skip)
    .limit(limit)
    .populate('requiredSkills.skill')
    .sort('title');
  sendSuccess(res, 200, roles, meta);
});

/**
 * GET /api/v1/roles/:id
 */
const getRoleById = asyncHandler(async (req, res) => {
  const role = await RoleProfile.findById(req.params.id).populate(
    'requiredSkills.skill'
  );
  if (!role) return sendError(res, 404, 'Role profile not found');
  sendSuccess(res, 200, role);
});

/**
 * POST /api/v1/roles
 */
const createRole = asyncHandler(async (req, res) => {
  const role = await RoleProfile.create(req.body);
  sendSuccess(res, 201, role);
});

/**
 * PUT /api/v1/roles/:id
 */
const updateRole = asyncHandler(async (req, res) => {
  const role = await RoleProfile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!role) return sendError(res, 404, 'Role profile not found');
  sendSuccess(res, 200, role);
});

/**
 * DELETE /api/v1/roles/:id
 */
const deleteRole = asyncHandler(async (req, res) => {
  const role = await RoleProfile.findByIdAndDelete(req.params.id);
  if (!role) return sendError(res, 404, 'Role profile not found');
  sendSuccess(res, 200, { message: 'Role deleted' });
});

module.exports = { getRoles, getRoleById, createRole, updateRole, deleteRole };
