'use strict';

const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

/**
 * Computes adaptive question weighting based on learner's recent quiz performance.
 *
 * Weighting rules:
 * - avgScore > 80%: High mastery → Target hard (prioritizes hard questions)
 * - avgScore < 40%: Remediation → Target easy (prioritizes easy foundational questions)
 * - otherwise: Balanced progression → Target medium (prioritizes medium questions)
 *
 * @param {string} officerId - User ObjectId string
 * @param {string|null} skillId - Skill ObjectId string
 * @param {Array} questions - Array of questions from the quiz
 * @returns {Promise<Array>} Adaptively ordered questions
 */
const selectNextQuestions = async (officerId, skillId, questions) => {
  if (!Array.isArray(questions) || questions.length <= 1) {
    return questions || [];
  }

  let avgScore = null;

  try {
    if (officerId) {
      let quizFilter = {};
      if (skillId) {
        const quizzesForSkill = await Quiz.find({ skill: skillId }).select('_id');
        const quizIds = quizzesForSkill.map((q) => q._id);
        quizFilter = { quiz: { $in: quizIds } };
      }

      const recentAttempts = await QuizAttempt.find({
        officer: officerId,
        ...quizFilter,
      })
        .sort('-createdAt')
        .limit(3)
        .select('score');

      if (recentAttempts.length > 0) {
        const total = recentAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
        avgScore = total / recentAttempts.length;
      }
    }
  } catch (err) {
    console.warn('[adaptiveQuizService] Error fetching attempts:', err.message);
  }

  // Partition questions by difficulty
  const easy = [];
  const medium = [];
  const hard = [];

  for (const q of questions) {
    const diff = (q.difficulty || 'medium').toLowerCase();
    if (diff === 'easy') easy.push(q);
    else if (diff === 'hard') hard.push(q);
    else medium.push(q);
  }

  // If no difficulty variation in pool, return original questions
  if (easy.length === 0 && hard.length === 0) {
    return questions;
  }

  // Determine priority order according to performance
  let orderedGroups;
  if (avgScore !== null && avgScore > 80) {
    // High performer: Hard questions first, then Medium, then Easy
    orderedGroups = [hard, medium, easy];
  } else if (avgScore !== null && avgScore < 40) {
    // Needs reinforcement: Easy questions first, then Medium, then Hard
    orderedGroups = [easy, medium, hard];
  } else {
    // Balanced: Medium first, followed by Easy and Hard
    orderedGroups = [medium, easy, hard];
  }

  const result = [];
  for (const group of orderedGroups) {
    result.push(...group);
  }

  return result;
};

module.exports = { selectNextQuestions };
