const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const Skill = require('../src/models/Skill');

describe('Domain Competency Taxonomy (Item 1)', () => {
  test('should accept valid categories from the 4-domain taxonomy and store subDomain', async () => {
    const validCategories = [
      'Statistical',
      'Technical',
      'DigitalGovernance',
      'BehaviouralManagerial',
    ];

    for (const category of validCategories) {
      const skill = new Skill({
        name: `Test Skill ${category}`,
        category,
        subDomain: 'Test SubDomain',
        description: 'Test description',
      });
      await skill.validate();
      assert.equal(skill.subDomain, 'Test SubDomain');
    }
  });

  test('should reject legacy or invalid categories', async () => {
    const invalidCategories = [
      'Analytical',
      'Domain',
      'Managerial',
      'Communication',
      'Digital',
      'UnknownCategory',
    ];

    for (const category of invalidCategories) {
      const skill = new Skill({
        name: `Invalid Skill ${category}`,
        category,
        subDomain: 'Test SubDomain',
      });
      await assert.rejects(async () => {
        await skill.validate();
      }, /is not a valid enum value/);
    }
  });
});
