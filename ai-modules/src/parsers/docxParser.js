const mammoth = require('mammoth');

const extractTextFromDOCX = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
};

module.exports = { extractTextFromDOCX };
