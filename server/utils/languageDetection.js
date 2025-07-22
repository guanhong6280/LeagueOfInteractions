/**
 * Simple language detection for English and Chinese
 * @param {string} text - The text to analyze
 * @returns {string} - 'en' for English, 'zh' for Chinese
 */
function detectLanguage(text) {
  // Chinese characters (Simplified and Traditional)
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/;
  
  // If text contains Chinese characters, it's Chinese
  if (chineseRegex.test(text)) {
    return 'zh';
  }
  
  // Otherwise, default to English
  return 'en';
}

module.exports = { detectLanguage }; 