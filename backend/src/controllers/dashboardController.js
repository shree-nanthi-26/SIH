const QuizAttempt = require('../models/QuizAttempt');
const OfficerProfile = require('../models/OfficerProfile');
const User = require('../models/User');
const { computeSkillGap } = require('../services/skillGapService');
const { sendSuccess } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/v1/dashboard/officer/:id
 * Personal competency summary for an officer.
 */
const getOfficerDashboard = asyncHandler(async (req, res) => {
  const officerId = req.params.id;

  // Skill gap data
  let gapData;
  try {
    gapData = await computeSkillGap(officerId);
  } catch {
    gapData = { gaps: [], summary: {} };
  }

  // Recent quiz attempts (last 10)
  const recentAttempts = await QuizAttempt.find({ officer: officerId })
    .sort('-createdAt')
    .limit(10)
    .populate('quiz', 'title skill')
    .lean();

  // Average quiz score
  const scoreAgg = await QuizAttempt.aggregate([
    { $match: { officer: require('mongoose').Types.ObjectId.createFromHexString(officerId) } },
    { $group: { _id: null, avgScore: { $avg: '$score' }, totalAttempts: { $sum: 1 } } },
  ]);

  const profile = await OfficerProfile.findOne({ user: officerId }).lean();

  sendSuccess(res, 200, {
    gapAnalysis: gapData,
    recentAttempts,
    quizStats: scoreAgg[0] || { avgScore: 0, totalAttempts: 0 },
    completedResources: profile?.completedResources?.length || 0,
  });
});

/**
 * GET /api/v1/dashboard/admin
 * Aggregate statistics for administrators.
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalOfficers = await User.countDocuments({ role: 'officer' });
  const totalProfiles = await OfficerProfile.countDocuments();

  // Average quiz scores across all officers
  const quizAgg = await QuizAttempt.aggregate([
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$score' },
        totalAttempts: { $sum: 1 },
      },
    },
  ]);

  // Officers with profiles assigned to roles
  const assignedRoles = await OfficerProfile.countDocuments({
    roleProfile: { $ne: null },
  });

  sendSuccess(res, 200, {
    totalOfficers,
    totalProfiles,
    assignedRoles,
    quizStats: quizAgg[0] || { avgScore: 0, totalAttempts: 0 },
  });
});

module.exports = { getOfficerDashboard, getAdminDashboard };
