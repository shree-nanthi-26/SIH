const mongoose = require('mongoose');

/**
 * QuizAttempt — records an officer's attempt at a quiz.
 */
const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    answers: [answerSchema],
    /** Score as a percentage (0–100). */
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    /** Total questions and correct count for quick access. */
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
