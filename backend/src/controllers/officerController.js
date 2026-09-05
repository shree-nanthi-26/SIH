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
 * Update officer's skills, assigned role, qualifications, experience, and previous trainings.
 */
const updateOfficerProfile = asyncHandler(async (req, res) => {
  const {
    currentSkills,
    roleProfile,
    qualifications,
    experience,
    previousTrainings,
  } = req.body;

  const profile = await OfficerProfile.findOne({ user: req.params.id });
  if (!profile) {
    return sendError(res, 404, 'Officer profile not found');
  }

  if (currentSkills !== undefined) {
    if (!Array.isArray(currentSkills)) {
      return sendError(res, 400, 'currentSkills must be an array');
    }
    profile.currentSkills = currentSkills;
  }

  if (roleProfile !== undefined) {
    profile.roleProfile = roleProfile || null;
  }

  if (qualifications !== undefined) {
    if (!Array.isArray(qualifications)) {
      return sendError(res, 400, 'qualifications must be an array');
    }
    for (const q of qualifications) {
      if (!q.degree || typeof q.degree !== 'string') {
        return sendError(res, 400, 'Each qualification requires a degree');
      }
    }
    profile.qualifications = qualifications;
  }

  if (experience !== undefined) {
    if (!Array.isArray(experience)) {
      return sendError(res, 400, 'experience must be an array');
    }
    for (const exp of experience) {
      if (!exp.organization || !exp.role || exp.fromYear === undefined) {
        return sendError(res, 400, 'Each experience entry requires organization, role, and fromYear');
      }
    }
    profile.experience = experience;
  }

  if (previousTrainings !== undefined) {
    if (!Array.isArray(previousTrainings)) {
      return sendError(res, 400, 'previousTrainings must be an array');
    }
    for (const t of previousTrainings) {
      if (!t.title || typeof t.title !== 'string') {
        return sendError(res, 400, 'Each training requires a title');
      }
    }
    profile.previousTrainings = previousTrainings;
  }

  await profile.save();

  const updated = await OfficerProfile.findById(profile._id)
    .populate('user', 'name email department designation role')
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
