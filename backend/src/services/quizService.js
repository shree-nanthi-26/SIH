const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { AppError } = require('../middleware/errorHandler');

/**
 * Score a quiz attempt.
 *
 * @param {string} quizId
 * @param {string} officerId - User ID
 * @param {Array<{ questionId: string, selectedIndex: number }>} answers
 * @returns {Promise<object>} The saved QuizAttempt document
 */
const scoreAttempt = async (quizId, officerId, answers) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError('Quiz not found', 404, 'QUIZ_NOT_FOUND');
  }

  const questionMap = new Map();
  for (const q of quiz.questions) {
    questionMap.set(q._id.toString(), q);
  }

  let correctCount = 0;
  const scoredAnswers = answers.map((a) => {
    const question = questionMap.get(a.questionId);
    if (!question) {
      throw new AppError(
        `Question ${a.questionId} not found in this quiz`,
        400,
        'INVALID_QUESTION'
      );
    }
    const isCorrect = question.correctIndex === a.selectedIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: a.questionId,
      selectedIndex: a.selectedIndex,
      isCorrect,
    };
  });

  const totalQuestions = quiz.questions.length;
  const score = +((correctCount / totalQuestions) * 100).toFixed(2);

  const attempt = await QuizAttempt.create({
    officer: officerId,
    quiz: quizId,
    answers: scoredAnswers,
    score,
    totalQuestions,
    correctCount,
  });

  return attempt;
};

module.exports = { scoreAttempt };
