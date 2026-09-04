const { computeSkillGap } = require('../services/skillGapService');
const { generateLearningPath } = require('../services/learningPathService');
const OfficerProfile = require('../models/OfficerProfile');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/v1/officers/:id/skill-gap
 */
const getSkillGap = asyncHandler(async (req, res) => {
  const result = await computeSkillGap(req.params.id);
  sendSuccess(res, 200, result);
});

/**
 * GET /api/v1/officers/:id/learning-path
 */
const getLearningPath = asyncHandler(async (req, res) => {
  const maxPerSkill = parseInt(req.query.maxPerSkill, 10) || 3;
  const result = await generateLearningPath(req.params.id, maxPerSkill);
  sendSuccess(res, 200, result);
});

/**
 * GET /api/v1/officers/:id/profile
 */
const getOfficerProfile = asyncHandler(async (req, res) => {
  const profile = await OfficerProfile.findOne({ user: req.params.id })
    .populate('user', 'name email department designation role')
    .populate('roleProfile')
    .populate('currentSkills.skill');

  if (!profile) {
    return sendError(res, 404, 'Officer profile not found');
  }

  sendSuccess(res, 200, profile);
});

/**
 * PUT /api/v1/officers/:id/profile
 * Update officer's current skills and/or assigned role.
 */
const updateOfficerProfile = asyncHandler(async (req, res) => {
  const { currentSkills, roleProfile } = req.body;

  const profile = await OfficerProfile.findOne({ user: req.params.id });
  if (!profile) {
    return sendError(res, 404, 'Officer profile not found');
  }

  if (currentSkills) profile.currentSkills = currentSkills;
  if (roleProfile) profile.roleProfile = roleProfile;

  await profile.save();

  const updated = await OfficerProfile.findById(profile._id)
    .populate('user', 'name email')
    .populate('roleProfile')
    .populate('currentSkills.skill');

  sendSuccess(res, 200, updated);
});

module.exports = {
  getSkillGap,
  getLearningPath,
  getOfficerProfile,
  updateOfficerProfile,
};
