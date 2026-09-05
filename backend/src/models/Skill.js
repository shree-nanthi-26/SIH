const mongoose = require('mongoose');

/**
 * Skill — a discrete competency that can be assessed and tracked.
 */
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Statistical',
        'Technical',
        'DigitalGovernance',
        'BehaviouralManagerial',
      ],
    },
    subDomain: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    /** Reference to an embedding vector (stored in embeddingVector or external DB). */
    embeddingVector: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
