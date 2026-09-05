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

const qualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true, trim: true },
    field: { type: String, trim: true, default: '' },
    institution: { type: String, trim: true, default: '' },
    year: { type: Number, default: null },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    fromYear: { type: Number, required: true },
    toYear: { type: Number, default: null }, // nullable for current
  },
  { _id: false }
);

const previousTrainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, trim: true, default: '' },
    completedAt: { type: Date, default: null },
    certificateUrl: { type: String, trim: true, default: '' },
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
    qualifications: [qualificationSchema],
    experience: [experienceSchema],
    previousTrainings: [previousTrainingSchema],
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
