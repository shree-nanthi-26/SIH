'use strict';

/**
 * Unit tests for analyticsService (Item 3).
 * OfficerProfile and QuizAttempt are mocked so no live MongoDB connection is needed.
 */
const { test, describe, mock, before, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

// ---- lightweight model stubs -------------------------------------------------
const mockProfiles = [];

// Stub require() for the three Mongoose models used by analyticsService
const originalLoad = Module._load.bind(Module);
Module._load = function stubbedLoad(request, parent, isMain) {
  if (request.includes('OfficerProfile')) {
    return {
      find: () => ({
        populate: () => ({ populate: () => ({ lean: () => Promise.resolve(mockProfiles) } ) } ),
      }),
    };
  }
  if (request.includes('QuizAttempt')) {
    return {
      aggregate: () => Promise.resolve([]),
    };
  }
  return originalLoad(request, parent, isMain);
};

// Import service AFTER the stub is in place
const { computeTopGapSkills, computeCompetencyTrend } = require('../src/services/analyticsService');

after(() => { Module._load = originalLoad; });
// -----------------------------------------------------------------------------

describe('Predictive Analytics Service (Item 3)', () => {
  test('computeTopGapSkills should return an array when called', async () => {
    const result = await computeTopGapSkills(5);
    assert.ok(Array.isArray(result), 'result should be an array');
    assert.ok(result.length <= 5, 'should be capped at limit');
  });

  test('computeCompetencyTrend should return trend data and direction', async () => {
    const result = await computeCompetencyTrend(6);
    assert.ok(result, 'result should be truthy');
    assert.ok(Array.isArray(result.trend), 'trend should be an array');
    assert.ok(['up', 'down', 'stable'].includes(result.direction), 'direction should be up/down/stable');
    assert.equal(typeof result.currentAvg, 'number');
    assert.equal(typeof result.totalEvaluatedAttempts, 'number');
  });
});
