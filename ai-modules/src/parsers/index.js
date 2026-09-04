const path = require('path');
const { extractTextFromPDF } = require('./pdfParser');
const { extractTextFromDOCX } = require('./docxParser');

/**
 * Automatically detect file type and extract text.
 * @param {string} filePath 
 * @param {string} mimeType 
 * @returns {Promise<string>}
 */
const extractText = async (filePath, mimeType) => {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf' || mimeType === 'application/pdf') {
        return await extractTextFromPDF(filePath);
    } 
    
    if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await extractTextFromDOCX(filePath);
    }
    
    if (ext === '.txt' || mimeType === 'text/plain') {
        return require('fs').readFileSync(filePath, 'utf-8');
    }
    
    // Add PPTX parser here later when needed
    throw new Error(`Unsupported file type: ${ext || mimeType}`);
};

module.exports = { extractText };
