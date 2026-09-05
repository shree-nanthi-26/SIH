'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const igotClient = require('../src/services/igotClient');

describe('iGOT Client Abstraction (Item 7)', () => {
  test('should expose getCourses, getCourseById, recordCompletion, getCompletions', () => {
    assert.equal(typeof igotClient.getCourses, 'function');
    assert.equal(typeof igotClient.getCourseById, 'function');
    assert.equal(typeof igotClient.recordCompletion, 'function');
    assert.equal(typeof igotClient.getCompletions, 'function');
  });

  test('getCourses should return mock courses in default mock mode', () => {
    const res = igotClient.getCourses();
    assert.ok(Array.isArray(res.courses));
    assert.ok(res.total > 0);
  });

  test('getCourseById should retrieve specific course', () => {
    const course = igotClient.getCourseById('IGOT-001');
    assert.ok(course);
    assert.equal(course.id, 'IGOT-001');
  });

  test('recordCompletion should store completion record', async () => {
    const res = await igotClient.recordCompletion({
      officerId: 'officer-test-igot',
      courseId: 'IGOT-001',
      score: 95,
    });
    assert.ok(res.id);
    assert.equal(res.score, 95);
    assert.equal(res.certificate, true);
  });
});
