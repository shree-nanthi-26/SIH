const LearningResource = require('../models/LearningResource');
const { computeSkillGap } = require('./skillGapService');

/**
 * Generate a personalised learning path for an officer.
 *
 * Strategy: for each skill gap (priority-ordered), find learning resources
 * that address that skill, cap at `maxPerSkill` resources per gap.
 *
 * @param {string} officerId - User ID
 * @param {number} [maxPerSkill=3] - Max resources per gap skill
 * @returns {Promise<object>} { learningPath: [...], totalResources }
 */
const generateLearningPath = async (officerId, maxPerSkill = 3) => {
  const { gaps } = await computeSkillGap(officerId);

  const learningPath = [];

  for (const gap of gaps) {
    const resources = await LearningResource.find({
      skills: gap.skillId,
    })
      .sort({ difficulty: 1 })
      .limit(maxPerSkill)
      .lean();

    learningPath.push({
      skillId: gap.skillId,
      skillName: gap.skillName,
      category: gap.category,
      gap: gap.gap,
      priority: gap.priority,
      resources: resources.map((r) => ({
        id: r._id,
        title: r.title,
        type: r.type,
        url: r.url,
        source: r.source,
        difficulty: r.difficulty,
        durationMinutes: r.durationMinutes,
      })),
    });
  }

  return {
    learningPath,
    totalResources: learningPath.reduce(
      (sum, lp) => sum + lp.resources.length,
      0
    ),
  };
};

module.exports = { generateLearningPath };
