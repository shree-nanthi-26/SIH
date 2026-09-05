const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { scoreAttempt } = require('../services/quizService');
const { selectNextQuestions } = require('../services/adaptiveQuizService');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginate } = require('../utils/pagination');

/**
 * GET /api/v1/quizzes
 */
const getQuizzes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.skill) filter.skill = req.query.skill;

  const total = await Quiz.countDocuments(filter);
  const { skip, limit, meta } = paginate(req.query, total);
  const quizzes = await Quiz.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('skill', 'name category')
    .populate('createdBy', 'name')
    .sort('-createdAt');
  sendSuccess(res, 200, quizzes, meta);
});

/**
 * GET /api/v1/quizzes/:id
 */
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('skill', 'name category')
    .populate('createdBy', 'name');
  if (!quiz) return sendError(res, 404, 'Quiz not found');

  const quizObj = quiz.toObject();
  const officerId = req.user ? req.user._id : req.query.officerId;
  const skillId = quiz.skill ? (quiz.skill._id || quiz.skill) : null;
  quizObj.questions = await selectNextQuestions(officerId, skillId, quizObj.questions);

  sendSuccess(res, 200, quizObj);
});

/**
 * POST /api/v1/quizzes
 */
const createQuiz = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const quiz = await Quiz.create(req.body);
  sendSuccess(res, 201, quiz);
});

/**
 * DELETE /api/v1/quizzes/:id
 */
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return sendError(res, 404, 'Quiz not found');
  sendSuccess(res, 200, { message: 'Quiz deleted' });
});

/**
 * POST /api/v1/quizzes/:id/attempt
 */
const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await scoreAttempt(
    req.params.id,
    req.user._id,
    req.body.answers
  );
  sendSuccess(res, 201, attempt);
});

/**
 * GET /api/v1/officers/:id/attempts
 */
const getOfficerAttempts = asyncHandler(async (req, res) => {
  const filter = { officer: req.params.id };
  const total = await QuizAttempt.countDocuments(filter);
  const { skip, limit, meta } = paginate(req.query, total);
  const attempts = await QuizAttempt.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('quiz', 'title skill')
    .sort('-createdAt');
  sendSuccess(res, 200, attempts, meta);
});

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  deleteQuiz,
  submitAttempt,
  getOfficerAttempts,
};
