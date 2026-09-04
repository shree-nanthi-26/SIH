const Skill = require('../models/Skill');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginate } = require('../utils/pagination');

/**
 * GET /api/v1/skills
 */
const getSkills = asyncHandler(async (req, res) => {
  const total = await Skill.countDocuments();
  const { skip, limit, meta } = paginate(req.query, total);
  const skills = await Skill.find().skip(skip).limit(limit).sort('name');
  sendSuccess(res, 200, skills, meta);
});

/**
 * GET /api/v1/skills/:id
 */
const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return sendError(res, 404, 'Skill not found');
  sendSuccess(res, 200, skill);
});

/**
 * POST /api/v1/skills
 */
const createSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.create(req.body);
  sendSuccess(res, 201, skill);
});

/**
 * PUT /api/v1/skills/:id
 */
const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!skill) return sendError(res, 404, 'Skill not found');
  sendSuccess(res, 200, skill);
});

/**
 * DELETE /api/v1/skills/:id
 */
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) return sendError(res, 404, 'Skill not found');
  sendSuccess(res, 200, { message: 'Skill deleted' });
});

module.exports = { getSkills, getSkillById, createSkill, updateSkill, deleteSkill };
