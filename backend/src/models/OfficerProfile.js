const mongoose = require('mongoose');

/**
 * OfficerProfile — an officer's current skill set, linked to a User and a RoleProfile.
 */
const currentSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    /** Self-assessed proficiency: 1 (basic) – 5 (expert). */
    selfAssessedLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    /** Verified proficiency (e.g. via quiz scores). Defaults to self-assessed. */
    verifiedLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { _id: false }
);

const officerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    roleProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoleProfile',
      default: null,
    },
    currentSkills: [currentSkillSchema],
    /** Completed learning resource IDs. */
    completedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('OfficerProfile', officerProfileSchema);
