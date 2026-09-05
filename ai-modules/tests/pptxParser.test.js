'use strict';

const JSZip = require('jszip');
const { extractTextFromPPTX } = require('../src/parsers/pptxParser');

async function buildMinimalPPTX(slideTexts) {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
  slideTexts.forEach((text, idx) => {
    zip.file(
      `ppt/slides/slide${idx + 1}.xml`,
      `<?xml version="1.0"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`,
    );
  });
  return zip.generateAsync({ type: 'nodebuffer' });
}

describe('extractTextFromPPTX', () => {
  test('extracts text from a single-slide PPTX buffer', async () => {
    const buf = await buildMinimalPPTX(['Hello World']);
    const result = await extractTextFromPPTX(buf);
    expect(result).toBe('Hello World');
  });

  test('extracts and joins text from multiple slides in order', async () => {
    const buf = await buildMinimalPPTX(['Statistical Methods', 'GIS Basics', 'Digital Governance']);
    const lines = (await extractTextFromPPTX(buf)).split('\n\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Statistical Methods');
    expect(lines[1]).toBe('GIS Basics');
    expect(lines[2]).toBe('Digital Governance');
  });

  test('returns empty string for a PPTX with no text nodes', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
    zip.file('ppt/slides/slide1.xml', '<?xml version="1.0"?><p:sld xmlns:p="x" xmlns:a="y"><p:cSld/></p:sld>');
    const buf = await zip.generateAsync({ type: 'nodebuffer' });
    expect(await extractTextFromPPTX(buf)).toBe('');
  });

  test('ignores slideLayout and other non-slide files', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
    zip.file('ppt/slides/slideLayout1.xml', '<root xmlns:a="x"><a:t>IGNORE ME</a:t></root>');
    zip.file(
      'ppt/slides/slide1.xml',
      '<?xml version="1.0"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:t>Data Collection Principles</a:t></p:sld>',
    );
    const buf = await zip.generateAsync({ type: 'nodebuffer' });
    const result = await extractTextFromPPTX(buf);
    expect(result).not.toContain('IGNORE ME');
    expect(result).toContain('Data Collection Principles');
  });
});
