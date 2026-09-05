'use strict';

const mongoose = require('mongoose');
const OfficerProfile = require('../models/OfficerProfile');
const LearningResource = require('../models/LearningResource');

/**
 * Apply course completion results to an officer's competency profile.
 *
 * Scoring logic:
 * - score >= 80: verifiedLevel bumped by +2
 * - score >= 60: verifiedLevel bumped by +1
 * - score < 60: no bump
 * Verified level is capped at 5. If verifiedLevel is null/undefined, it initializes from selfAssessedLevel.
 * Also appends resource._id to profile.completedResources if not already present.
 *
 * @param {string} officerId - User ID or OfficerProfile ID
 * @param {string} courseId - externalId of the course (e.g. 'IGOT-001' or 'NSSTA-001')
 * @param {number} score - 0 to 100 score
 * @param {'igot'|'nssta'} [source='igot'] - Course provider source
 * @returns {Promise<object|null>} Updated profile or null
 */
const applyCompletionToProfile = async (officerId, courseId, score, source = 'igot') => {
  try {
    if (!officerId || !courseId) return null;

    // If mongoose is not connected (e.g. unit tests without live DB), skip cleanly
    if (mongoose.connection.readyState !== 1) {
      return null;
    }

    // Find the learning resource by source and externalId
    const resource = await LearningResource.findOne({ source, externalId: courseId });
    if (!resource || !resource.skills || resource.skills.length === 0) {
      return null;
    }

    // Find the officer profile
    const query = [];
    if (mongoose.isValidObjectId(officerId)) {
      query.push({ _id: officerId }, { user: officerId });
    }
    if (query.length === 0) return null;

    const profile = await OfficerProfile.findOne({ $or: query });
    if (!profile) return null;

    // Determine bump amount
    let bump = 0;
    if (score >= 80) {
      bump = 2;
    } else if (score >= 60) {
      bump = 1;
    }

    let modified = false;

    if (bump > 0) {
      const skillIdSet = new Set(resource.skills.map((s) => s.toString()));

      for (const cs of profile.currentSkills) {
        if (skillIdSet.has(cs.skill.toString())) {
          const currentLevel = cs.verifiedLevel ?? cs.selfAssessedLevel ?? 1;
          const nextLevel = Math.min(5, currentLevel + bump);
          if (nextLevel !== cs.verifiedLevel) {
            cs.verifiedLevel = nextLevel;
            modified = true;
          }
        }
      }
    }

    if (resource._id && !profile.completedResources.some((r) => r.toString() === resource._id.toString())) {
      profile.completedResources.push(resource._id);
      modified = true;
    }

    if (modified) {
      await profile.save();
    }

    return profile;
  } catch (err) {
    console.warn('[competencyUpdateService] Failed to apply completion:', err.message);
    return null;
  }
};

module.exports = { applyCompletionToProfile };
