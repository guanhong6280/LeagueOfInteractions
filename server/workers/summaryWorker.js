// summaryWorker.js - SQS message consumer for skin comment summarization
const { receiveSummaryMessages, deleteSummaryMessage, getMessageRetryCount, logMessageProcessing } = require('../config/summaryQueue');
const { summarizeComments } = require('../utils/summaryGeneration');
const Skin = require('../models/Skin');
const SkinComment = require('../models/SkinComment');
const mongoose = require('mongoose');

// Configuration
const BATCH_SIZE = 1; // Process one message at a time for better error isolation
const POLLING_INTERVAL = 5000; // 5 seconds between polls when no messages

// Worker state
let isShuttingDown = false;
let activeMessageCount = 0;

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, starting graceful shutdown...');
  isShuttingDown = true;
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, starting graceful shutdown...');
  isShuttingDown = true;
});

/**
 * Check if we should generate a summary based on dual-trigger logic
 * @param {Object} skin - Skin document
 * @param {number} newCommentCount - Number of new comments since last summary
 * @returns {boolean} Whether to generate summary
 */
function shouldGenerateSummary(skin, newCommentCount) {
  const now = new Date();
  const lastSummary = skin.summaryGeneratedAt;

  // Threshold trigger: 5+ new comments
  if (newCommentCount >= 5) {
    console.log(`📊 Threshold trigger: ${newCommentCount} new comments >= 5`);
    return true;
  }

  // Time trigger: 7+ days since last summary AND at least 1 new comment
  if (lastSummary) {
    const daysSinceLastSummary = (now - lastSummary) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSummary >= 7 && newCommentCount >= 1) {
      console.log(`⏰ Time trigger: ${daysSinceLastSummary.toFixed(1)} days >= 7, ${newCommentCount} new comments >= 1`);
      return true;
    }
  } else if (newCommentCount >= 1) {
    // First summary: any new comments
    console.log(`🎯 First summary trigger: ${newCommentCount} new comments`);
    return true;
  }

  console.log(`❌ No trigger met: ${newCommentCount} new comments, last summary: ${lastSummary ? `${((now - lastSummary) / (1000 * 60 * 60 * 24)).toFixed(1)} days ago` : 'never'}`);
  return false;
}

/**
 * Get comments and replies for a skin since the last summary
 * @param {number} skinId - Skin ID
 * @param {Date} lastSummaryDate - Last summary generation date
 * @returns {Promise<Array>} Array of comment/reply texts
 */
async function getCommentsForSummary(skinId, lastSummaryDate, session) {
  const matchBase = { skinId };
  const sinceFilter = lastSummaryDate
    ? { $gt: lastSummaryDate }
    : { $exists: true }; // pass everything if no date

  const pipeline = [
    { $match: matchBase },

    {
      $facet: {
        comments: [
          { $match: { status: 'approved' } },
          { $project: { _id: 0, text: '$comment', createdAt: '$createdAt' } },
          { $match: { createdAt: sinceFilter } },
        ],
        replies: [
          { $unwind: { path: '$replies', preserveNullAndEmptyArrays: false } },
          { $match: { 'replies.status': 'approved' } },
          { $project: { _id: 0, text: '$replies.comment', createdAt: '$replies.createdAt' } },
          { $match: { createdAt: sinceFilter } },
        ],
      }
    },

    // Merge arrays into one flat stream
    { $project: { merged: { $concatArrays: ['$comments', '$replies'] } } },
    { $unwind: '$merged' },
    { $replaceRoot: { newRoot: '$merged' } },
    { $sort: { createdAt: 1 } },
    { $project: { _id: 0, text: 1 } },
    { $limit: 400 },
  ];

  const items = await SkinComment.aggregate(pipeline)
    .session(session)
    .option({ maxTimeMS: 60_000 }); // server-side op timeout
  const texts = items.map(i => i.text);

  console.log(
    `📝 Found ${texts.length} approved texts (comments + replies) since ${lastSummaryDate ? lastSummaryDate.toISOString() : 'beginning'
    }`
  );

  return texts; // ["comment text...", "reply text...", ...]
}

/**
 * Generate summary text from comment/reply texts
 * @param {Array} texts - Array of comment/reply text strings
 * @returns {Promise<string>} Generated summary
 */
// wherever you call it
async function generateSummaryText(prevSummary, newComments) {
  // Validate early with clear messages
  if (!Array.isArray(newComments) || newComments.length === 0) {
    throw new Error("No comments provided for summarization");
  }

  return summarizeComments(prevSummary, newComments);
}

/**
 * Process a single summary message
 * @param {Object} message - SQS message
 * @returns {Promise<boolean>} Success status
 */
async function processSummaryMessage(message) {
  const startTime = Date.now();
  const messageId = message.MessageId;
  const retryCount = getMessageRetryCount(message);

  logMessageProcessing(message, 'STARTED');

  try {
    // Parse message body
    let messageBody;
    try {
      messageBody = JSON.parse(message.Body);
    } catch (error) {
      console.error(`❌ Failed to parse message body:`, error);
      throw new Error(`BadMessageBody: ${error.message}`);
    }
    const { skinId, triggerType, timestamp } = messageBody;

    console.log(`🔄 Processing skin ${skinId} (trigger: ${triggerType}, retry: ${retryCount})`);

    // Use database transaction for atomicity
    const session = await mongoose.startSession();

    try {
      let skin, commentTexts;
      await session.withTransaction(async () => {
        // Get skin with optimistic locking
        skin = await Skin.findOne({ skinId })
          .session(session)
          .setOptions({ maxTimeMS: 60_000 });

        if (!skin) throw new Error(`Skin ${skinId} not found`);

        // Get comments and replies since last summary
        commentTexts = await getCommentsForSummary(
          skinId,
          skin.summaryGeneratedAt,
          session
        );
      });

      // Check if we should generate summary
      if (!shouldGenerateSummary(skin, commentTexts.length)) {
        console.log(`⏭️ Skipping summary generation for skin ${skinId} - conditions not met`);
        
        // Delete message from queue even when skipping
        await deleteSummaryMessage(message.ReceiptHandle);
        logMessageProcessing(message, 'SKIPPED');
        
        const processingTime = Date.now() - startTime;
        console.log(`🎉 Successfully processed skin ${skinId} in ${processingTime}ms (skipped)`);
        
        return true;
      }

      const prevSummary = skin.skinSummary || '';
      // Generate summary
      const summaryText = await generateSummaryText(prevSummary, commentTexts);

      // Update skin with new summary (atomic operation)
      await session.withTransaction(async () => {
        const updateResult = await Skin.updateOne(
          { skinId, summaryGeneratedAt: skin.summaryGeneratedAt },
          { $set: { skinSummary: summaryText, summaryGeneratedAt: new Date() } }
        )
          .session(session)
          .setOptions({ maxTimeMS: 60_000 });

        if (updateResult.matchedCount === 0) {
          throw new Error('Concurrent update detected - skin was modified by another process');
        }

        if (updateResult.modifiedCount === 0) {
          console.log('ℹ️ Update skipped — new summary is same as existing');
        }

        console.log(`✅ Summary updated for skin ${skinId}: ${summaryText.length} characters, ${commentTexts.length} texts`);
      });

      // Delete message from queue on success
      await deleteSummaryMessage(message.ReceiptHandle);
      logMessageProcessing(message, 'COMPLETED');

      const processingTime = Date.now() - startTime;
      console.log(`🎉 Successfully processed skin ${skinId} in ${processingTime}ms`);

      return true;

    } finally {
      await session.endSession();
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Failed to process message ${messageId} after ${processingTime}ms:`, error);

    // Log different error types for monitoring
    if (String(error.message || "").startsWith("BadMessageBody")) {
      logMessageProcessing(message, 'Bad_Message');
    } else if (error.name === 'ValidationException') {
      logMessageProcessing(message, 'BEDROCK_ERROR');
    } else if (error.message.includes('Concurrent update')) {
      logMessageProcessing(message, 'CONCURRENT_UPDATE');
    } else if (error.message.includes('not found')) {
      logMessageProcessing(message, 'NOT_FOUND');
    } else {
      logMessageProcessing(message, 'PROCESSING_ERROR');
    }

    // Don't delete message - let SQS handle retry via RedrivePolicy
    return false;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Main worker loop
 */
async function runWorker() {
  console.log('🚀 Starting summary worker...');
  console.log(`📊 Configuration: batch=${BATCH_SIZE}, polling=${POLLING_INTERVAL}ms`);

  let idleBackoff = POLLING_INTERVAL;

  while (!isShuttingDown) {
    try {
      // Check if we should stop processing new messages
      if (isShuttingDown && activeMessageCount === 0) {
        console.log('🛑 Shutdown complete - no active messages');
        break;
      }

      // Receive messages from queue
      const messages = await receiveSummaryMessages(BATCH_SIZE);

      if (!messages || messages.length === 0) {
        await sleep(idleBackoff);
        // optional backoff during idle:
        idleBackoff = Math.min(idleBackoff * 2, 60_000);
        continue;
      }
      idleBackoff = POLLING_INTERVAL;

      console.log(`📨 Received ${messages.length} message(s)`);

      // Process each message
      for (const message of messages) {
        if (isShuttingDown) {
          console.log('🛑 Shutdown requested, stopping message processing');
          break;
        }

        activeMessageCount++;

        try {
          // Process with timeout
          await processSummaryMessage(message);

        } finally {
          activeMessageCount--;
        }
      }

    } catch (error) {
      console.error('❌ Worker loop error:', error);

      // Wait before retrying to avoid tight error loops
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log('👋 Summary worker stopped');
}

// Export for testing
module.exports = {
  runWorker,
  processSummaryMessage,
  shouldGenerateSummary,
  getCommentsForSummary,
  generateSummaryText
};

// Run worker if called directly
if (require.main === module) {
  runWorker().catch(error => {
    console.error('💥 Worker crashed:', error);
    process.exit(1);
  });
}
