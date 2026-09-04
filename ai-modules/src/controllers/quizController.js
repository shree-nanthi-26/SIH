const fs = require('fs');
const path = require('path');
const { extractText } = require('../parsers');
const { generateMCQs } = require('../services/mcqGenerator');

/**
 * POST /api/quiz/generate
 * Handles file upload, text extraction, and MCQ generation.
 */
const generateQuizFromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        console.log(`Processing file: ${req.file.originalname} (${mimeType})`);

        // 1. Extract Text
        let text;
        try {
            text = await extractText(filePath, mimeType);
        } catch (err) {
            return res.status(400).json({ success: false, error: `Failed to extract text: ${err.message}` });
        }

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ success: false, error: "Not enough text extracted from the file to generate questions." });
        }

        // 2. Generate MCQs using Gemini
        const mcqs = await generateMCQs(text);

        // Clean up uploaded file
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });

        // 3. Return the result
        return res.status(200).json({
            success: true,
            data: {
                title: `Generated Quiz from ${req.file.originalname}`,
                questions: mcqs
            }
        });

    } catch (error) {
        console.error("Quiz Generation Error:", error);
        
        // Ensure file is cleaned up on error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
        }
        
        return res.status(500).json({ 
            success: false, 
            error: "Failed to generate quiz. The AI might have returned an invalid format." 
        });
    }
};

module.exports = { generateQuizFromFile };
