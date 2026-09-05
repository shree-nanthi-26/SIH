'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key_for_tests';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Answer a learner's question using Gemini, scoped to their skill gap and learning path context.
 *
 * @param {string} question - Learner's query
 * @param {object} context - Officer's profile, skill gaps, and learning recommendations
 * @returns {Promise<{ answer: string, sources?: Array, contextSummary?: object }>}
 */
const answerLearnerQuery = async (question, context = {}) => {
  if (!question || typeof question !== 'string') {
    throw new Error('Question string is required');
  }

  if (apiKey === 'dummy_key_for_tests' || process.env.NODE_ENV === 'test') {
    const topGap = context?.topGap || (context?.gaps && context.gaps[0]?.skillName) || 'Statistical Analysis';
    return {
      answer: `Based on your competency profile, your primary focus area is ${topGap}. I recommend prioritizing the targeted courses in your learning path and testing your progress with the adaptive assessment.`,
      sources: context?.recommendedResources ? context.recommendedResources.slice(0, 2) : [],
      contextSummary: {
        role: context?.role || 'Statistical Officer',
        identifiedGaps: context?.gaps?.length || 0,
      },
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const contextStr = JSON.stringify(context, null, 2).slice(0, 8000);

  const prompt = `
You are the SkillVista AI Learning Advisor for India's Official Statistical System (MoSPI / iGOT Karmayogi).
Your goal is to answer the officer's question accurately, concisely, and helpfully based on their current competency profile, skill gaps, and recommended learning resources.

OFFICER CONTEXT:
${contextStr}

OFFICER QUESTION:
"${question}"

GUIDELINES:
1. Ground your advice in the officer's actual gaps, role requirements, and recommended courses.
2. Maintain a professional, encouraging, and respectful tone appropriate for government statistical officers.
3. Keep the response concise (2-3 paragraphs max).
4. Mention specific course titles or training programmes from their recommendations when applicable.
5. Provide actionable next steps.
`;

  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  return {
    answer,
    contextSummary: {
      role: context?.role || 'Statistical Officer',
      identifiedGaps: context?.gaps?.length || 0,
    },
  };
};

module.exports = { answerLearnerQuery };
