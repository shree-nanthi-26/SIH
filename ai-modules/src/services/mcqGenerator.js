const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key_for_tests';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate MCQs from text using Gemini, with a strict JSON schema and retry logic.
 * 
 * @param {string} text - The extracted text to generate MCQs from.
 * @returns {Promise<Array>} - Array of MCQ objects
 */
const generateMCQs = async (text) => {
    // If testing without a key, return a mock response
    if (apiKey === 'dummy_key_for_tests' || process.env.NODE_ENV === 'test') {
        return [
            {
                question: "What is the capital of India?",
                options: ["Mumbai", "New Delhi", "Chennai", "Kolkata"],
                correctIndex: 1,
                explanation: "New Delhi is the capital of India."
            }
        ];
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Ensure text is not too large for the prompt. Chunking strategy: take first 15000 chars.
    const chunkedText = text.length > 15000 ? text.substring(0, 15000) : text;

    const basePrompt = `
You are an expert educational content creator. Based on the following text, generate exactly 10 multiple-choice questions (MCQs).
Each question must have exactly 4 options and 1 correct answer.
You must return the response as a strict JSON array of objects, with NO markdown formatting, NO backticks, and NO extra text.
The JSON array should contain objects with the following schema:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": integer (0 to 3),
  "explanation": "string"
}

Text to use:
"""
${chunkedText}
"""
    `;

    const tryGenerate = async (promptToUse) => {
        const result = await model.generateContent(promptToUse);
        const responseText = result.response.text();
        
        // Clean up potential markdown formatting from LLM response
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsed = JSON.parse(cleanedText);
        
        // Basic schema validation
        if (!Array.isArray(parsed)) throw new Error("Result is not a JSON array");
        
        for (const item of parsed) {
            if (!item.question || !Array.isArray(item.options) || item.options.length !== 4 || 
                typeof item.correctIndex !== 'number' || item.correctIndex < 0 || item.correctIndex > 3) {
                throw new Error("Invalid MCQ schema in response");
            }
        }
        
        return parsed;
    };

    try {
        return await tryGenerate(basePrompt);
    } catch (error) {
        console.warn("First LLM generation failed or returned invalid JSON. Retrying with stricter prompt...", error.message);
        const strictPrompt = basePrompt + "\n\nCRITICAL: DO NOT INCLUDE ANY MARKDOWN. JUST RAW JSON ARRAY. MUST BE EXACTLY 4 OPTIONS PER QUESTION.";
        return await tryGenerate(strictPrompt);
    }
};

module.exports = { generateMCQs };
