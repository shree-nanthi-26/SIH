const OfficerProfile = require('../models/OfficerProfile');
const { AppError } = require('../middleware/errorHandler');

/**
 * Compute skill gaps for an officer based on their assigned role profile.
 *
 * Gap = requiredLevel − currentLevel (effective).
 * Weighted priority = gap × weight.
 * Returns a sorted array (highest priority first).
 *
 * @param {string} officerId - User ID
 * @returns {Promise<object>} { gaps: [...], summary }
 */
const computeSkillGap = async (officerId) => {
  const profile = await OfficerProfile.findOne({ user: officerId })
    .populate('roleProfile')
    .populate('currentSkills.skill');

  if (!profile) {
    throw new AppError('Officer profile not found', 404, 'PROFILE_NOT_FOUND');
  }

  if (!profile.roleProfile) {
    throw new AppError(
      'No role profile assigned to this officer',
      400,
      'NO_ROLE_ASSIGNED'
    );
  }

  // Populate the role profile's required skills
  await profile.roleProfile.populate('requiredSkills.skill');

  const currentMap = new Map();
  for (const cs of profile.currentSkills) {
    const skillId = cs.skill._id.toString();
    currentMap.set(skillId, {
      name: cs.skill.name,
      category: cs.skill.category,
      selfAssessedLevel: cs.selfAssessedLevel,
      verifiedLevel: cs.verifiedLevel,
      effectiveLevel: cs.verifiedLevel ?? cs.selfAssessedLevel,
    });
  }

  const gaps = [];

  for (const rs of profile.roleProfile.requiredSkills) {
    const skillId = rs.skill._id.toString();
    const current = currentMap.get(skillId) || {
      name: rs.skill.name,
      category: rs.skill.category,
      selfAssessedLevel: 0,
      verifiedLevel: null,
      effectiveLevel: 0,
    };

    const gap = rs.requiredLevel - current.effectiveLevel;
    if (gap > 0) {
      gaps.push({
        skillId: rs.skill._id,
        skillName: current.name,
        category: current.category,
        currentLevel: current.effectiveLevel,
        requiredLevel: rs.requiredLevel,
        gap,
        weight: rs.weight,
        priority: +(gap * rs.weight).toFixed(2),
      });
    }
  }

  // Sort descending by priority
  gaps.sort((a, b) => b.priority - a.priority);

  const summary = {
    totalRequiredSkills: profile.roleProfile.requiredSkills.length,
    skillsWithGap: gaps.length,
    averageGap:
      gaps.length > 0
        ? +(gaps.reduce((s, g) => s + g.gap, 0) / gaps.length).toFixed(2)
        : 0,
  };

  return { gaps, summary };
};

module.exports = { computeSkillGap };
