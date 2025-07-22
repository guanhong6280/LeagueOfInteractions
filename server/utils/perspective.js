const axios = require('axios');

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;

async function getPerspectiveScores(text, language = 'en') {
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`;
  
  // Base attributes that work for all languages
  const requestedAttributes = {
    TOXICITY: {}
  };
  
  // Only include SPAM attribute for English text
  if (language === 'en') {
    requestedAttributes.SPAM = {};
  }
  
  const body = {
    comment: { text },
    languages: [language],
    requestedAttributes
  };

  const response = await axios.post(url, body);
  
  const result = {
    toxicity: response.data.attributeScores.TOXICITY.summaryScore.value
  };
  
  // Only include spam score for English text
  if (language === 'en') {
    result.spam = response.data.attributeScores.SPAM?.summaryScore?.value || 0;
  } else {
    result.spam = 0; // Default spam score for non-English text
  }
  
  return result;
}

module.exports = { getPerspectiveScores };