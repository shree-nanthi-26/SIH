'use strict';

const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

const sampleQuestions = [
  { question: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0, difficulty: 'easy' },
  { question: 'Q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1, difficulty: 'medium' },
  { question: 'Q3', options: ['A', 'B', 'C', 'D'], correctIndex: 2, difficulty: 'hard' },
  { question: 'Q4', options: ['A', 'B', 'C', 'D'], correctIndex: 3, difficulty: 'hard' },
  { question: 'Q5', options: ['A', 'B', 'C', 'D'], correctIndex: 0, difficulty: 'easy' },
];

let mockAttemptScores = [];

const originalLoad = Module._load.bind(Module);
Module._load = function stubbedLoad(request, parent, isMain) {
  if (request.includes('QuizAttempt')) {
    return {
      find: () => ({
        sort: () => ({
          limit: () => ({
            select: () => Promise.resolve(mockAttemptScores.map((s) => ({ score: s }))),
          }),
        }),
      }),
    };
  }
  if (request.endsWith('/Quiz') || request.endsWith('\\Quiz') || request === '../models/Quiz') {
    return {
      find: () => ({
        select: () => Promise.resolve([]),
      }),
    };
  }
  return originalLoad(request, parent, isMain);
};

const { selectNextQuestions } = require('../src/services/adaptiveQuizService');

after(() => {
  Module._load = originalLoad;
});

describe('Adaptive Assessments (Item 3)', () => {
  test('should return all questions when empty or single question', async () => {
    const res = await selectNextQuestions(null, null, []);
    assert.deepEqual(res, []);
  });

  test('should prioritize hard questions for high performers (>80% avg)', async () => {
    mockAttemptScores = [85, 90, 95];
    const res = await selectNextQuestions('user123', null, sampleQuestions);
    assert.equal(res.length, sampleQuestions.length);
    assert.equal(res[0].difficulty, 'hard');
    assert.equal(res[1].difficulty, 'hard');
  });

  test('should prioritize easy questions for learners needing remediation (<40% avg)', async () => {
    mockAttemptScores = [20, 35, 30];
    const res = await selectNextQuestions('user123', null, sampleQuestions);
    assert.equal(res.length, sampleQuestions.length);
    assert.equal(res[0].difficulty, 'easy');
    assert.equal(res[1].difficulty, 'easy');
  });

  test('should prioritize medium questions for intermediate performers (40-80% avg)', async () => {
    mockAttemptScores = [60, 70, 65];
    const res = await selectNextQuestions('user123', null, sampleQuestions);
    assert.equal(res.length, sampleQuestions.length);
    assert.equal(res[0].difficulty, 'medium');
  });
});
