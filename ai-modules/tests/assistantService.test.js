'use strict';

const { answerLearnerQuery } = require('../src/services/assistantService');

describe('AI Assistant Service', () => {
  it('should return context-aware advice for learner queries in test mode', async () => {
    const question = 'How can I improve my sampling theory skills?';
    const context = {
      role: 'Statistical Officer',
      topGap: 'Sampling Theory',
      gaps: [{ skillName: 'Sampling Theory', gap: 2 }],
      recommendedResources: [{ title: 'Survey Methodology & Sampling' }],
    };

    const res = await answerLearnerQuery(question, context);
    expect(res).toBeDefined();
    expect(res.answer).toContain('Sampling Theory');
    expect(res.sources).toHaveLength(1);
    expect(res.contextSummary.role).toBe('Statistical Officer');
  });

  it('should throw when question is missing or invalid', async () => {
    await expect(answerLearnerQuery('')).rejects.toThrow();
  });
});
