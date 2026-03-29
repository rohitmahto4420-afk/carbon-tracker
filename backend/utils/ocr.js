const Tesseract = require('tesseract.js');

async function extractTextFromImage(imageBuffer) {
  try {
    const result = await Tesseract.recognize(imageBuffer, 'eng');
    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}

module.exports = { extractTextFromImage };
