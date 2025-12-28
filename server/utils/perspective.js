const axios = require('axios');

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;

async function getPerspectiveScores(text, language = 'en') {
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`;
  
  // Base attributes (Toxicity is standard across languages)
  const requestedAttributes = {
    TOXICITY: {}
  };
  
  // Only request SPAM for English (Perspective API limitation/recommendation)
  if (language === 'en') {
    requestedAttributes.SPAM = {};
  }
  
  const body = {
    comment: { text },
    languages: [language],
    requestedAttributes
  };

  // We perform the request. If this fails (4xx/5xx), axios throws an error
  // which is caught by the middleware above.
  const response = await axios.post(url, body);
  
  // Safely extract scores
  const toxicity = response.data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
  
  let spam = 0;
  if (language === 'en') {
    spam = response.data.attributeScores?.SPAM?.summaryScore?.value || 0;
  }
  
  return { toxicity, spam };
}

module.exports = { getPerspectiveScores };