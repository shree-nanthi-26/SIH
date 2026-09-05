'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const nssta = require('../src/services/nsstaMockClient');

describe('NSSTA TPAC Mock Adapter (Item 1)', () => {
  test('should return all mock TPAC courses with pagination', () => {
    const res = nssta.getCourses();
    assert.ok(Array.isArray(res.courses));
    assert.ok(res.total >= 5);
    assert.equal(res.courses[0].provider, 'NSSTA');
  });

  test('should filter courses by category and mode', () => {
    const filtered = nssta.getCourses({ category: 'Technical', mode: 'in-person' });
    assert.ok(filtered.courses.length > 0);
    for (const c of filtered.courses) {
      assert.equal(c.category, 'Technical');
      assert.equal(c.mode, 'in-person');
    }
  });

  test('should find a course by id', () => {
    const course = nssta.getCourseById('NSSTA-001');
    assert.ok(course);
    assert.equal(course.id, 'NSSTA-001');
    assert.ok(course.eligibility);
  });

  test('should record completion record', async () => {
    const comp = await nssta.recordCompletion({
      officerId: 'officer-test-123',
      courseId: 'NSSTA-001',
      score: 85,
    });
    assert.ok(comp.id);
    assert.equal(comp.score, 85);
    assert.equal(comp.certificate, true);

    const officerCompletions = nssta.getCompletions({ officerId: 'officer-test-123' });
    assert.ok(officerCompletions.some((c) => c.courseId === 'NSSTA-001'));
  });
});
