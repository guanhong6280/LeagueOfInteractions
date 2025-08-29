// summaryGeneration.js
const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

// ---- Config (single place) ----
const DEFAULT_REGION = "us-east-1";
const DEFAULT_MODEL_ID = "amazon.titan-tg1-large";
const MAX_PREV_SUMMARY_CHARS = 2000;
const MAX_NEW_COMMENTS_CHARS = 8000;

// Singleton client (can be overridden in tests)
const defaultClient = new BedrockRuntimeClient({
  region: DEFAULT_REGION,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5_000,
    requestTimeout:   120_000,
  }),
});

// ---- Small utilities ----
function normalizeComments(comments) {
  if (!Array.isArray(comments)) return [];
  return comments
    .map(t => (t ?? "").trim())
    .filter(Boolean);
}

function joinAndTrimTail(texts, maxChars, sep = "\n\n") {
  let joined = texts.join(sep);
  if (joined.length > maxChars) {
    // keep the tail (most recent chunk if texts are chronological)
    joined = joined.slice(-maxChars);
  }
  return joined;
}

function trimTail(str, maxChars) {
  if (!str) return "";
  return str.length > maxChars ? str.slice(-maxChars) : str;
}

function buildPrompt(prevSummary, newBlock) {
  return [
`You are an expert assistant that analyzes League of Legends skin feedback.
Summarize the user comments about the skin’s design, visual effects, and overall quality.
Focus on visual appeal and design elements, in-game model quality, splash art quality, value for money, and unique features or animations.
Write your response as full sentences (no bullet points) and keep it to no more than seven sentences.

You are updating an existing summary using ONLY the NEW feedback below.
- Keep prior takeaways that still hold.
- Adjust, refine, or replace points when the new feedback indicates a shift or contradiction.
- Collapse duplicates and avoid repetition.
- Be concise and user-facing.

Existing summary (may be truncated):
\`\`\`
${prevSummary || "(none)"}
\`\`\`

New approved comments & replies (may be truncated):
\`\`\`
${newBlock}
\`\`\``
  ].join("\n");
}

// ---- Core function ----
/**
 * Update an existing summary using ONLY the new approved comments/replies.
 * @param {string} prevSummary
 * @param {string[]} newComments
 * @param {{ client?: BedrockRuntimeClient, modelId?: string }} [opts]
 * @returns {Promise<string>}
 */
async function summarizeComments(prevSummary, newComments, opts = {}) {
  const client = opts.client ?? defaultClient;
  const modelId = opts.modelId ?? DEFAULT_MODEL_ID;

  const prev = trimTail((prevSummary ?? "").trim(), MAX_PREV_SUMMARY_CHARS);
  const comments = normalizeComments(newComments);

  if (comments.length === 0) {
    // Nothing new; keep previous summary unchanged
    return prev;
  }

  const newBlock = joinAndTrimTail(comments, MAX_NEW_COMMENTS_CHARS);
  const prompt = buildPrompt(prev, newBlock);

  // Optional: log after normalization/truncation
  console.log(`🤖 Summarizing ${comments.length} comments (${newBlock.length} chars); prev=${prev.length} chars`);

  try {
    const response = await client.send(new ConverseCommand({
      modelId,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    }));

    const updated = response.output?.message?.content?.[0]?.text?.trim();
    if (!updated) throw new Error("Provider returned empty summary");
    console.log(`✅ Summary generated: ${updated.length} chars`);
    return updated;

  } catch (err) {
    // Normalize common provider errors into cleaner messages
    const name = err?.name || "Error";
    const msg  = err?.message || String(err);

    if (name === "ValidationException" && msg.includes("messages")) {
      throw new Error("Bedrock rejected message roles/content. Ensure only 'user'/'assistant' roles and valid text payloads.");
    }
    if (name === "AccessDeniedException") {
      throw new Error("Access denied to AWS Bedrock (check IAM permissions and model access).");
    }
    if (name === "ThrottlingException") {
      throw new Error("Rate limit exceeded by AWS Bedrock. Please retry with backoff.");
    }
    throw new Error(`Failed to summarize comments: ${msg}`);
  }
}

module.exports = { summarizeComments };