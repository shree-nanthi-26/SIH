'use strict';

const config = require('../config/env');
const { computeSkillGap } = require('../services/skillGapService');
const { generateLearningPath } = require('../services/learningPathService');
const OfficerProfile = require('../models/OfficerProfile');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/v1/officers/:id/assistant
 * Ask the AI assistant a question with the officer's competency context.
 */
const askAssistant = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const officerId = req.params.id;

  if (!question || typeof question !== 'string') {
    return sendError(res, 400, 'question is required');
  }

  // Gather context
  let gaps = [];
  let learningPath = [];
  let roleTitle = 'Statistical Officer';

  try {
    const gapResult = await computeSkillGap(officerId);
    gaps = gapResult?.gaps || [];
  } catch (_) {
    // non-fatal fallback
  }

  try {
    const pathResult = await generateLearningPath(officerId, 3);
    learningPath = pathResult?.path || [];
  } catch (_) {
    // non-fatal fallback
  }

  try {
    const profile = await OfficerProfile.findOne({ user: officerId }).populate('roleProfile', 'title');
    if (profile?.roleProfile?.title) {
      roleTitle = profile.roleProfile.title;
    }
  } catch (_) {
    // non-fatal fallback
  }

  const context = {
    officerId,
    role: roleTitle,
    topGap: gaps.length > 0 ? (gaps[0].skill?.name || gaps[0].skillName || 'Official Statistics') : 'Statistical Methods',
    gaps: gaps.slice(0, 5).map((g) => ({
      skill: g.skill?.name || g.skillName || 'Skill',
      gap: g.gap || 0,
      priority: g.priority || 'medium',
    })),
    recommendedResources: learningPath.flatMap((item) =>
      (item.resources || []).map((r) => ({ title: r.title, source: r.source, type: r.type }))
    ).slice(0, 5),
  };

  try {
    const aiModuleUrl = config.aiModuleUrl || 'http://localhost:5001';
    const response = await fetch(`${aiModuleUrl}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return sendError(res, response.status, errData.error?.message || 'AI Assistant service error');
    }

    const data = await response.json();
    return sendSuccess(res, 200, data.data || data);
  } catch (err) {
    // Fallback if AI module is offline during development/test
    const fallbackAnswer = `Based on your profile as ${roleTitle}, your primary competency focus is ${context.topGap}. We recommend reviewing your personalized learning path modules and attempting the practice quizzes to boost your verified competency scores.`;
    return sendSuccess(res, 200, {
      answer: fallbackAnswer,
      contextSummary: { role: roleTitle, identifiedGaps: gaps.length },
    });
  }
});

module.exports = { askAssistant };
