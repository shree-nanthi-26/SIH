const mongoose = require('mongoose');

/**
 * LearningResource — a course, article, or video that addresses one or more skills.
 */
const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['video', 'article', 'course', 'module', 'document'],
      default: 'course',
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    /** Skills this resource helps develop. */
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    /** Source of the resource. */
    source: {
      type: String,
      enum: ['internal', 'igot', 'external'],
      default: 'internal',
    },
    /** Duration in minutes. */
    durationMinutes: {
      type: Number,
      default: 0,
    },
    /** Difficulty level. */
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningResource', learningResourceSchema);
