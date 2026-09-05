'use strict';

const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const mongoose = require('mongoose');

const dummyResourceId = new mongoose.Types.ObjectId();
const dummySkillId = new mongoose.Types.ObjectId();
const dummyOfficerId = new mongoose.Types.ObjectId();

let mockProfileData = null;
let saved = false;

const originalLoad = Module._load.bind(Module);
Module._load = function stubbedLoad(request, parent, isMain) {
  if (request.includes('LearningResource')) {
    return {
      findOne: () => Promise.resolve({
        _id: dummyResourceId,
        source: 'igot',
        externalId: 'IGOT-001',
        skills: [dummySkillId],
      }),
    };
  }
  if (request.includes('OfficerProfile')) {
    return {
      findOne: () => Promise.resolve({
        ...mockProfileData,
        save: async () => {
          saved = true;
          return mockProfileData;
        },
      }),
    };
  }
  return originalLoad(request, parent, isMain);
};

const { applyCompletionToProfile } = require('../src/services/competencyUpdateService');

const prevReadyState = mongoose.connection.readyState;
mongoose.connection.readyState = 1;

after(() => {
  mongoose.connection.readyState = prevReadyState;
  Module._load = originalLoad;
});

describe('Automatic Competency Score Updates (Item 8)', () => {
  test('should bump verifiedLevel by +2 for score >= 80', async () => {
    saved = false;
    mockProfileData = {
      _id: dummyOfficerId,
      currentSkills: [
        { skill: dummySkillId, selfAssessedLevel: 2, verifiedLevel: 2 },
      ],
      completedResources: [],
    };

    const res = await applyCompletionToProfile(dummyOfficerId.toString(), 'IGOT-001', 85, 'igot');
    assert.ok(res);
    assert.equal(res.currentSkills[0].verifiedLevel, 4);
    assert.equal(saved, true);
    assert.equal(res.completedResources.length, 1);
  });

  test('should bump verifiedLevel by +1 for score >= 60', async () => {
    saved = false;
    mockProfileData = {
      _id: dummyOfficerId,
      currentSkills: [
        { skill: dummySkillId, selfAssessedLevel: 3, verifiedLevel: 3 },
      ],
      completedResources: [],
    };

    const res = await applyCompletionToProfile(dummyOfficerId.toString(), 'IGOT-001', 70, 'igot');
    assert.ok(res);
    assert.equal(res.currentSkills[0].verifiedLevel, 4);
    assert.equal(saved, true);
  });

  test('should not exceed max verifiedLevel of 5', async () => {
    saved = false;
    mockProfileData = {
      _id: dummyOfficerId,
      currentSkills: [
        { skill: dummySkillId, selfAssessedLevel: 4, verifiedLevel: 4 },
      ],
      completedResources: [],
    };

    const res = await applyCompletionToProfile(dummyOfficerId.toString(), 'IGOT-001', 95, 'igot');
    assert.ok(res);
    assert.equal(res.currentSkills[0].verifiedLevel, 5);
  });

  test('should not bump verifiedLevel for score < 60', async () => {
    saved = false;
    mockProfileData = {
      _id: dummyOfficerId,
      currentSkills: [
        { skill: dummySkillId, selfAssessedLevel: 2, verifiedLevel: 2 },
      ],
      completedResources: [],
    };

    const res = await applyCompletionToProfile(dummyOfficerId.toString(), 'IGOT-001', 45, 'igot');
    assert.ok(res);
    assert.equal(res.currentSkills[0].verifiedLevel, 2);
  });
});
