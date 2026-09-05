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
  let profile = await OfficerProfile.findOne({
    $or: [{ user: officerId }, { _id: officerId }],
  })
    .populate('roleProfile')
    .populate('currentSkills.skill');

  if (!profile) {
    const RoleProfile = require('../models/RoleProfile');
    const defaultRole = await RoleProfile.findOne();
    try {
      profile = await OfficerProfile.create({
        user: officerId,
        roleProfile: defaultRole?._id || null,
        currentSkills: [],
      });
      if (defaultRole) {
        profile = await OfficerProfile.findById(profile._id)
          .populate('roleProfile')
          .populate('currentSkills.skill');
      }
    } catch (_) {
      // Return empty gap data if officerId is not a valid user reference
      return { gaps: [], summary: { totalRequiredSkills: 0, skillsWithGap: 0, averageGap: 0 } };
    }
  }

  if (!profile || !profile.roleProfile) {
    return {
      gaps: [],
      summary: { totalRequiredSkills: 0, skillsWithGap: 0, averageGap: 0 },
    };
  }

  // Populate the role profile's required skills
  await profile.roleProfile.populate('requiredSkills.skill');

  const currentMap = new Map();
  for (const cs of profile.currentSkills) {
    // Guard: skill reference may be null if the skill document was deleted
    if (!cs.skill) continue;
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
    // Guard: skill reference may be null if the skill document was deleted
    if (!rs.skill) continue;
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
        skillName: current.name || 'Unknown Skill',
        category: current.category || 'General',
        currentLevel: current.effectiveLevel,
        requiredLevel: rs.requiredLevel,
        gap,
        weight: rs.weight || 1,
        priority: +(gap * (rs.weight || 1)).toFixed(2),
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
