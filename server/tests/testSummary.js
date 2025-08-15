// tests/testSummary.js
require('dotenv').config();           // if you load creds from .env
const { summarizeComments } = require('../utils/summaryGeneration.js');

async function runTest() {
  const comments = [
    "I love the splash art—so detailed!",
    "Colours are hard to read in dark maps.",
    "Model animation is smooth but recall is slow.",
    "Feels premium, but particle effects could pop more."
  ].join('\n\n');

  console.log('\n=== INPUT COMMENTS ===\n', comments);

  try {
    const summary = await summarizeComments(comments);
    console.log('\n=== GENERATED SUMMARY ===\n', summary);
  } catch (err) {
    console.error('\n❌ Summarization failed:', err);
    process.exit(1);
  }
}

runTest();