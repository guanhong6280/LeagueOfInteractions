// summaryGeneration.js
const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "us-east-1" });

/**
 * Summarize skin rating comments into bulleted pros & cons.
 * @param {string} text - Concatenated user comments about a skin
 * @returns {Promise<string>} - The LLM's summary in pros/cons format
 */
async function summarizeComments(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for summarization');
  }

  // Combine your instructions and the comments into one "user" message
  const prompt = `
You are an expert assistant that analyzes League of Legends skin feedback. 
Summarize the user comments about the skin’s design, visual effects, and overall quality. 
Focus on visual appeal and design elements, in-game model quality, splash art quality, value for money, and unique features or animations. 
Write your response as full sentences (no bullet points) and keep it to no more than seven sentences. 

Here are the user comments:
${text}
`.trim();

  try {
    console.log('🤖 Calling Bedrock with model: amazon.titan-text-express-v1');
    console.log('📝 Input prompt length:', prompt.length, 'characters');

    const response = await client.send(
      new ConverseCommand({
        modelId: "amazon.titan-tg1-large",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt }
            ]
          }
        ]
      })
    );

    console.log('✅ Bedrock API call successful');

    const summary = response.output.message.content[0].text;
    if (!summary || !summary.trim()) {
      throw new Error('No summary generated from the model');
    }

    console.log('📝 Generated summary length:', summary.length, 'characters');
    return summary;

  } catch (error) {
    console.error('❌ Error in summarizeComments:', error);

    if (error.name === 'ValidationException' && error.message.includes('messages')) {
      throw new Error(`Invalid message roles – Bedrock only accepts 'user' or 'assistant'. Original: ${error.message}`);
    }
    if (error.name === 'AccessDeniedException') {
      throw new Error(`Access denied to AWS Bedrock. Check your IAM permissions. ${error.message}`);
    }
    if (error.name === 'ThrottlingException') {
      throw new Error(`Rate limit exceeded. Try again later. ${error.message}`);
    }

    throw new Error(`Failed to summarize comments: ${error.message}`);
  }
}

module.exports = { summarizeComments };