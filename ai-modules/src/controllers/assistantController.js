'use strict';

const { answerLearnerQuery } = require('../services/assistantService');

/**
 * Handle AI Assistant query
 * POST /api/assistant/query
 * Body: { question: string, context: object }
 */
const queryAssistant = async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({
        success: false,
        error: { message: 'question is required in request body' },
      });
    }

    const result = await answerLearnerQuery(question, context || {});
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in assistantController:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal Server Error' },
    });
  }
};

module.exports = { queryAssistant };
