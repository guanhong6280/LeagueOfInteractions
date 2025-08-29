// summaryQueue.js - SQS Configuration for Comment Summary Pipeline
const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
require('dotenv').config();
const client = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Queue URLs (set these in your environment variables)
const SUMMARY_QUEUE_URL = process.env.SUMMARY_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/YOUR_ACCOUNT/skin-summary-queue';
const SUMMARY_DLQ_URL = process.env.SUMMARY_DLQ_URL || 'https://sqs.us-east-1.amazonaws.com/YOUR_ACCOUNT/skin-summary-dlq';

// Configuration constants
const VISIBILITY_TIMEOUT = 60; // 1 minute - enough for Bedrock API calls
const MAX_RECEIVE_COUNT = 3; // Messages go to DLQ after 3 failed attempts

/**
 * Send a message to trigger summary check for a skin
 * @param {number} skinId - The skin ID that received a new comment
 * @param {string} triggerType - 'NEW_COMMENT' or 'SCHEDULED_CHECK'
 * @param {number} jitterMs - Optional random delay in milliseconds (0-15000ms)
 */
async function enqueueSummaryCheck(skinId, triggerType = 'NEW_COMMENT') {
  try {

    const command = new SendMessageCommand({
      QueueUrl: SUMMARY_QUEUE_URL,
      MessageBody: JSON.stringify({
        skinId: Number(skinId),
        triggerType,
        timestamp: new Date().toISOString()
      }),
      DelaySeconds: Math.floor(Math.random() * 15),
      MessageAttributes: {
        skinId: {
          DataType: 'Number',
          StringValue: String(skinId)
        },
        triggerType: {
          DataType: 'String',
          StringValue: triggerType
        },
      },
      // Standard queue - no FIFO fields needed
    });

    const result = await client.send(command);
    console.log(`✅ Summary check enqueued for skin ${skinId}:`, result.MessageId);
    return result;
  } catch (error) {
    console.error(`❌ Failed to enqueue summary check for skin ${skinId}:`, error);
    // Don't throw error - we don't want comment saving to fail if SQS is down
    return null;
  }
}

/**
 * Receive messages from the summary queue
 * @param {number} maxMessages - Maximum number of messages to receive (1-10)
 */
async function receiveSummaryMessages(maxMessages = 1) {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: SUMMARY_QUEUE_URL,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 20, // Long polling
      MessageAttributeNames: ['All'],
      VisibilityTimeout: VISIBILITY_TIMEOUT, // 5 minutes for Bedrock processing
      AttributeNames: ['ApproximateReceiveCount'] // Track retry attempts
    });

    const result = await client.send(command);
    return result.Messages || [];
  } catch (error) {
    console.error('❌ Failed to receive summary messages:', error);
    throw error;
  }
}

/**
 * Delete a processed message from the queue
 * @param {string} receiptHandle - The message receipt handle
 */
async function deleteSummaryMessage(receiptHandle) {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: SUMMARY_QUEUE_URL,
      ReceiptHandle: receiptHandle
    });

    await client.send(command);
    console.log('✅ Summary message deleted from queue');
  } catch (error) {
    console.error('❌ Failed to delete summary message:', error);
    throw error;
  }
}

/**
 * Get message retry count for logging/debugging
 * @param {Object} message - SQS message object
 * @returns {number} - Number of times message has been received
 */
function getMessageRetryCount(message) {
  return parseInt(message.Attributes?.ApproximateReceiveCount || '0');
}

/**
 * Log message processing attempt for debugging
 * @param {Object} message - SQS message object
 * @param {string} action - What we're doing with the message
 */
function logMessageProcessing(message, action) {
  const retryCount = getMessageRetryCount(message);
  console.log(`📝 Processing message ${message.MessageId} (attempt ${retryCount}): ${action}`);
}

/**
 * Send a scheduled check message for all skins that need weekly updates
 * (This would be called by a cron job)
 * @param {number[]} skinIds - Array of skin IDs to check
 * @param {boolean} addJitter - Whether to add random delays (default: true)
 */
async function enqueueWeeklyChecks(skinIds) {
  const sends = skinIds.map((skinId) =>
    client.send(new SendMessageCommand({
      QueueUrl: SUMMARY_QUEUE_URL,
      MessageBody: JSON.stringify({
        skinId: Number(skinId),
        triggerType: 'SCHEDULED_CHECK',
        timestamp: new Date().toISOString()
      }),
      DelaySeconds: Math.floor(Math.random() * 15),
      MessageAttributes: {
        skinId: { DataType: 'Number', StringValue: String(skinId) },
        triggerType: { DataType: 'String', StringValue: 'SCHEDULED_CHECK' },
      },
    }))
    .then(value => ({ status: 'fulfilled', value }))
    .catch(reason => ({ status: 'rejected', reason }))
  );

  const results = await Promise.all(sends);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`📊 Weekly checks enqueued: ${successful}/${skinIds.length} successful`);
  return successful;
}

module.exports = {
  enqueueSummaryCheck,
  receiveSummaryMessages,
  deleteSummaryMessage,
  enqueueWeeklyChecks,
  getMessageRetryCount,
  logMessageProcessing,
  SUMMARY_QUEUE_URL,
  SUMMARY_DLQ_URL,
  VISIBILITY_TIMEOUT,
  MAX_RECEIVE_COUNT
};
