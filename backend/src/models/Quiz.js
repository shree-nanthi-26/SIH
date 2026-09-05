const mongoose = require('mongoose');

/**
 * Quiz — a set of MCQs linked to a skill or learning resource.
 */
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Each question must have exactly 4 options',
      },
    },
    /** Index (0–3) of the correct option. */
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: { type: String, default: '' },
    /**
     * Difficulty level assigned by Gemini during generation.
     * Used by adaptiveQuizService to weight question selection
     * based on the officer's recent performance history.
     */
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'A quiz must have at least one question',
      },
    },
    /** Skill this quiz assesses. */
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      default: null,
    },
    /** Learning resource this quiz was generated from. */
    linkedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningResource',
      default: null,
    },
    /** User who created / generated the quiz. */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Whether this quiz was AI-generated. */
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
