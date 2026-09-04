const mongoose = require('mongoose');

/**
 * RoleProfile — defines the required skills and proficiency levels for a role.
 */
const requiredSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    /** Required proficiency level: 1 (basic) – 5 (expert). */
    requiredLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    /** Priority weight for gap ranking (higher = more critical). */
    weight: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { _id: false }
);

const roleProfileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Role title is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    requiredSkills: [requiredSkillSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoleProfile', roleProfileSchema);
