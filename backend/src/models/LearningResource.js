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
    /**
     * Resource type.
     * 'lab' = an embeddable interactive lab linked via embedUrl (e.g. Colab, CodeSandbox).
     */
    type: {
      type: String,
      enum: ['video', 'article', 'course', 'module', 'document', 'lab'],
      default: 'course',
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    /**
     * For type='lab': iframe-embeddable or new-tab sandbox URL.
     * Rendered as "Open Lab" button in the frontend.
     */
    embedUrl: {
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
    /**
     * Source of the resource.
     * 'nssta' = NSSTA TPAC-recommended training programme.
     */
    source: {
      type: String,
      enum: ['internal', 'igot', 'external', 'nssta'],
      default: 'internal',
    },
    /**
     * External course ID used to map iGOT/NSSTA completion records back to this resource.
     * Populated with the provider's course ID (e.g. 'IGOT-001', 'NSSTA-001').
     */
    externalId: {
      type: String,
      trim: true,
      default: '',
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
    /**
     * Language of the resource.
     * Allows learners to filter by preferred language.
     */
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Odia'],
      default: 'English',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningResource', learningResourceSchema);
