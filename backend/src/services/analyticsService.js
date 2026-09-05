const OfficerProfile = require('../models/OfficerProfile');
const RoleProfile = require('../models/RoleProfile');
const Skill = require('../models/Skill');
const QuizAttempt = require('../models/QuizAttempt');

/**
 * Compute top emerging skill gaps across all officers assigned to role profiles.
 *
 * Strategy:
 * 1. Queries all OfficerProfiles that have an active roleProfile assigned.
 * 2. Populates role requirements and current skill proficiencies.
 * 3. Calculates the effective gap (requiredLevel - effectiveLevel) and weighted priority for each gap.
 * 4. Aggregates and sums priority scores across officers, grouped by skill.
 * 5. Returns the top N skills ranked by total weighted priority, indicating high-impact organizational training needs.
 *
 * @param {number} [limit=5] - Maximum number of top gap skills to return
 * @returns {Promise<Array<object>>} Top gap skills with aggregated priorities and officer counts
 */
const computeTopGapSkills = async (limit = 5) => {
  const profiles = await OfficerProfile.find({ roleProfile: { $ne: null } })
    .populate({
      path: 'roleProfile',
      populate: { path: 'requiredSkills.skill', select: 'name category subDomain' },
    })
    .populate('currentSkills.skill', 'name category subDomain')
    .lean();

  if (!profiles || profiles.length === 0) {
    return [];
  }

  const skillAggMap = new Map();

  for (const profile of profiles) {
    if (!profile.roleProfile || !profile.roleProfile.requiredSkills) continue;

    // Build map of officer's current skill levels
    const currentMap = new Map();
    if (profile.currentSkills) {
      for (const cs of profile.currentSkills) {
        if (!cs.skill) continue;
        const sId = cs.skill._id ? cs.skill._id.toString() : cs.skill.toString();
        const effectiveLevel = cs.verifiedLevel ?? cs.selfAssessedLevel ?? 0;
        currentMap.set(sId, effectiveLevel);
      }
    }

    // Evaluate gaps against role profile requirements
    for (const rs of profile.roleProfile.requiredSkills) {
      if (!rs.skill) continue;
      const sId = rs.skill._id ? rs.skill._id.toString() : rs.skill.toString();
      const currentLevel = currentMap.get(sId) || 0;
      const gap = rs.requiredLevel - currentLevel;

      if (gap > 0) {
        const weight = rs.weight || 1;
        const priority = gap * weight;

        const existing = skillAggMap.get(sId) || {
          skillId: sId,
          skillName: rs.skill.name || 'Unknown Skill',
          category: rs.skill.category || 'General',
          subDomain: rs.skill.subDomain || '',
          totalPriority: 0,
          officerCount: 0,
          totalGap: 0,
        };

        existing.totalPriority += priority;
        existing.officerCount += 1;
        existing.totalGap += gap;
        skillAggMap.set(sId, existing);
      }
    }
  }

  const aggregatedList = Array.from(skillAggMap.values()).map((item) => ({
    skillId: item.skillId,
    skillName: item.skillName,
    category: item.category,
    subDomain: item.subDomain,
    totalPriority: +item.totalPriority.toFixed(1),
    officerCount: item.officerCount,
    avgGap: +(item.totalGap / item.officerCount).toFixed(1),
  }));

  // Sort descending by total priority
  aggregatedList.sort((a, b) => b.totalPriority - a.totalPriority);

  return aggregatedList.slice(0, limit);
};

/**
 * Compute monthly competency trends and moving averages from verified quiz attempts.
 *
 * Strategy:
 * 1. Computes the starting date threshold (e.g. past 6 months).
 * 2. Uses MongoDB aggregation pipeline on QuizAttempt grouping by year & month.
 * 3. Aggregates monthly average score, attempt count, and pass count.
 * 4. Calculates a 2-period moving average to smooth short-term variance.
 * 5. Evaluates overall trend trajectory (up / down / stable).
 *
 * @param {number} [months=6] - Number of previous calendar months to aggregate
 * @returns {Promise<object>} Monthly trend array, direction indicator, and summary statistics
 */
const computeCompetencyTrend = async (months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const monthlyAgg = await QuizAttempt.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        avgScore: { $avg: '$score' },
        attemptsCount: { $sum: 1 },
        passCount: {
          $sum: { $cond: [{ $gte: ['$score', 60] }, 1, 0] },
        },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const trendData = monthlyAgg.map((item) => {
    const y = item._id.year;
    const m = item._id.month;
    const label = `${monthNames[m - 1]} ${y}`;
    return {
      year: y,
      month: m,
      label,
      avgScore: +item.avgScore.toFixed(1),
      attemptsCount: item.attemptsCount,
      passRate: item.attemptsCount > 0 ? +((item.passCount / item.attemptsCount) * 100).toFixed(1) : 0,
    };
  });

  // Calculate moving average (simple 2-period moving average)
  for (let i = 0; i < trendData.length; i++) {
    if (i === 0) {
      trendData[i].movingAvg = trendData[i].avgScore;
    } else {
      trendData[i].movingAvg = +((trendData[i].avgScore + trendData[i - 1].avgScore) / 2).toFixed(1);
    }
  }

  // Determine direction
  let direction = 'stable';
  if (trendData.length >= 2) {
    const firstScore = trendData[0].avgScore;
    const lastScore = trendData[trendData.length - 1].avgScore;
    const delta = lastScore - firstScore;
    if (delta > 2) direction = 'up';
    else if (delta < -2) direction = 'down';
  }

  const latest = trendData.length > 0 ? trendData[trendData.length - 1] : null;

  return {
    trend: trendData,
    direction,
    currentAvg: latest ? latest.avgScore : 0,
    totalEvaluatedAttempts: trendData.reduce((sum, t) => sum + t.attemptsCount, 0),
  };
};

module.exports = {
  computeTopGapSkills,
  computeCompetencyTrend,
};
