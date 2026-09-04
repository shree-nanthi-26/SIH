const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key_for_tests';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Get embeddings for a given text using Gemini's text-embedding-004 model.
 * 
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
const getEmbedding = async (text) => {
  // If in test environment without a real key, return a mock embedding
  if (apiKey === 'dummy_key_for_tests' || process.env.NODE_ENV === 'test') {
      return Array(768).fill(0.1);
  }

  const model = genAI.getGenerativeModel({ model: "text-embedding-004"});
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
};

module.exports = { getEmbedding };
