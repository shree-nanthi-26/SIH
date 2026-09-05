const fs = require('fs');
const JSZip = require('jszip');

/**
 * Extract plain text from a PPTX file.
 * Opens the presentation archive and parses text elements from all slide XML files.
 *
 * @param {string|Buffer} filePathOrBuffer - Path to the PPTX file or Buffer containing the file data
 * @returns {Promise<string>} Combined extracted text from all slides
 */
const extractTextFromPPTX = async (filePathOrBuffer) => {
  const buffer = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer
    : fs.readFileSync(filePathOrBuffer);

  const zip = await JSZip.loadAsync(buffer);

  // Find all slide files matching ppt/slides/slide<number>.xml
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      return numA - numB;
    });

  const slideTexts = [];

  for (const slidePath of slidePaths) {
    const xmlContent = await zip.files[slidePath].async('string');
    // Match text nodes in DrawingML: <a:t>text</a:t>
    const matches = xmlContent.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi) || [];
    const textPieces = matches
      .map((m) => m.replace(/<[^>]+>/g, '').trim())
      .filter((t) => t.length > 0);

    if (textPieces.length > 0) {
      slideTexts.push(textPieces.join(' '));
    }
  }

  return slideTexts.join('\n\n');
};

module.exports = { extractTextFromPPTX };
