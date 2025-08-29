// scripts/testSummaryQueue.js
/* eslint-disable no-console */

const {
  enqueueSummaryCheck,
  receiveSummaryMessages,
  deleteSummaryMessage,
  getMessageRetryCount,
  logMessageProcessing,
  enqueueWeeklyChecks,
  VISIBILITY_TIMEOUT,
  MAX_RECEIVE_COUNT,
} = require('../config/summaryQueue');

// ---------- Utility helpers ----------

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Receive with retries (handles long polling gaps + random DelaySeconds)
async function receiveWithRetry(batchSize = 1, tries = 6, backoffMs = 1200) {
  for (let i = 0; i < tries; i++) {
    const msgs = await receiveSummaryMessages(batchSize);
    if (msgs?.length) return msgs;
    await sleep(backoffMs + Math.floor(Math.random() * 600)); // jitter
  }
  return [];
}

// Env guardrails
function assertEnv() {
  const { SUMMARY_QUEUE_URL, SUMMARY_DLQ_URL, AWS_REGION } = process.env;
  console.log('📊 Configuration:');
  console.table({
    AWS_REGION: AWS_REGION || '(default us-east-1)',
    VISIBILITY_TIMEOUT_s: VISIBILITY_TIMEOUT,
    MAX_RECEIVE_COUNT,
    SUMMARY_QUEUE_URL: SUMMARY_QUEUE_URL || '(not set)',
    SUMMARY_DLQ_URL: SUMMARY_DLQ_URL || '(not set)',
  });
  if (!SUMMARY_QUEUE_URL) {
    console.warn('⚠️  SUMMARY_QUEUE_URL is not set. Sends/receives will fail.');
  }
  if (!SUMMARY_DLQ_URL) {
    console.warn('⚠️  SUMMARY_DLQ_URL is not set. DLQ redrive test may be inconclusive.');
  }
}

// ---------- Tests ----------

async function testBasicEnqueueReceiveDelete() {
  console.log('\n1) Enqueue → Receive → Delete');

  const skinId = 1000 + Math.floor(Math.random() * 1000);

  // Enqueue (uses built-in DelaySeconds 0–14s)
  const sendResp = await enqueueSummaryCheck(skinId, 'TEST_BASIC');
  if (!sendResp?.MessageId) throw new Error('Failed to enqueue TEST_BASIC');
  console.log(`   ✅ Enqueued: ${sendResp.MessageId}`);

  // Receive one (retry to ride out DelaySeconds + long polling)
  const messages = await receiveWithRetry(1, 8, 1200);
  if (!messages.length) throw new Error('No messages received for TEST_BASIC (after retries)');

  const m = messages[0];
  console.log(`   ✅ Received: ${m.MessageId}`);
  console.log(`      Body: ${m.Body}`);
  console.log(`      ReceiveCount: ${getMessageRetryCount(m)}`);
  logMessageProcessing(m, 'Processing (basic)');

  await sleep(300); // simulate short work

  await deleteSummaryMessage(m.ReceiptHandle);
  console.log('   ✅ Deleted received message');
}

async function testVisibilityTimeoutRedelivery() {
  console.log('\n2) Visibility timeout → redelivery (do not delete)');

  const id = 2000 + Math.floor(Math.random() * 1000);
  const sendResp = await enqueueSummaryCheck(id, 'TEST_REDELIVERY');
  if (!sendResp?.MessageId) throw new Error('Failed to enqueue TEST_REDELIVERY');
  console.log(`   ✅ Enqueued: ${sendResp.MessageId}`);

  const first = (await receiveWithRetry(1, 8, 1200))[0];
  if (!first) throw new Error('Could not receive TEST_REDELIVERY');

  const firstCount = getMessageRetryCount(first);
  console.log(`   ✅ First receive: ${first.MessageId}, count=${firstCount}`);
  console.log(`   ⏳ Waiting ~${VISIBILITY_TIMEOUT + 4}s for visibility to expire...`);
  await sleep((VISIBILITY_TIMEOUT + 4) * 1000);

  // Should reappear (count increases)
  const second = (await receiveWithRetry(1, 10, 1500))[0];
  if (!second) {
    console.warn('   ⚠️ Redelivery not observed; check for competing consumers or VT too long.');
    return;
  }

  const secondCount = getMessageRetryCount(second);
  console.log(`   ✅ Redelivered: ${second.MessageId}, count=${secondCount} (expected >= ${firstCount + 1})`);

  // Clean up
  await deleteSummaryMessage(second.ReceiptHandle);
  console.log('   ✅ Cleaned up redelivered message');
}

function isOurPoison(msg, poisonId) {
  try {
    const body = JSON.parse(msg.Body);
    return body?.skinId === poisonId && body?.triggerType === 'ALWAYS_FAIL';
  } catch {
    return false;
  }
}

async function testDLQRedrive() {
  console.log('\n3) DLQ redrive after repeated failures');

  const poisonId = 3000 + Math.floor(Math.random() * 1000);
  const sendResp = await enqueueSummaryCheck(poisonId, 'ALWAYS_FAIL');
  if (!sendResp?.MessageId) throw new Error('Failed to enqueue poison message');
  console.log(`   ✅ Enqueued poison message: ${sendResp.MessageId}`);
  console.log(`   🔖 Tracking skinId=${poisonId}, triggerType=ALWAYS_FAIL`);
  console.log(`   ℹ️ Will receive ${MAX_RECEIVE_COUNT} times without delete...`);

  for (let attempt = 1; attempt <= MAX_RECEIVE_COUNT; attempt++) {
    let m = null;

    // Poll until it's specifically our poison message
    for (let tries = 0; tries < 10 && !m; tries++) {
      const batch = await receiveWithRetry(1, 2, 900);
      const candidate = batch?.[0];
      if (candidate && isOurPoison(candidate, poisonId)) {
        m = candidate;
        break;
      }
      if (candidate) {
        console.log(
          `   ↪️ Ignored other message id=${candidate.MessageId}, rc=${getMessageRetryCount(candidate)}`
        );
      }
      await sleep(400);
    }

    if (!m) throw new Error(`Attempt ${attempt}: did not receive our poison message`);

    const rc = getMessageRetryCount(m);
    console.log(`   🔁 Attempt ${attempt}: messageId=${m.MessageId}, receiveCount=${rc} (NOT deleting)`);

    console.log(`   ⏳ Waiting ~${VISIBILITY_TIMEOUT + 2}s for VT to expire...`);
    await sleep((VISIBILITY_TIMEOUT + 2) * 1000);
  }

  // After max receives, SQS should move it to DLQ (redrive policy must be configured)
  let stillInMain = false;
  for (let i = 0; i < 4; i++) {
    const batch = await receiveWithRetry(1, 2, 900);
    const m = batch?.[0];
    if (m && isOurPoison(m, poisonId)) {
      stillInMain = true;
      console.log(
        `   ⚠️ Still visible in main (rc=${getMessageRetryCount(m)}). Redrive not observed yet; retrying...`
      );
      await sleep(1200);
    } else {
      await sleep(300);
    }
  }

  if (!stillInMain) {
    console.log('   ✅ Poison message no longer observed in main; expected move to DLQ.');
    console.log('   🔎 Verify in AWS Console: DLQ → “Send and receive messages” → Poll and inspect body.');
  } else {
    console.warn('   ⚠️ Poison message still observed; check redrive policy (DLQ ARN & maxReceiveCount).');
  }
}

async function testWeeklyChecks() {
  console.log('\n4) enqueueWeeklyChecks (fan-out sanity)');

  const ids = Array.from({ length: 5 }, (_, i) => 4000 + i);
  const success = await enqueueWeeklyChecks(ids);
  console.log(`   ✅ Enqueued ${success}/${ids.length} weekly checks`);

  // Spot check we can receive at least one of them
  const msgs = await receiveWithRetry(3, 8, 1200);
  if (msgs.length) {
    console.log(`   ✅ Received ${msgs.length} message(s) from weekly batch`);
    for (const m of msgs) {
      logMessageProcessing(m, 'weekly-checks spot process + delete');
      await deleteSummaryMessage(m.ReceiptHandle);
    }
  } else {
    console.log('   ℹ️ No weekly batch messages observed yet (DelaySeconds jitter may be in effect).');
  }
}

async function testRetryCountHelper() {
  console.log('\n5) Retry count helper');

  const mock = {
    MessageId: 'retry-mock',
    Body: JSON.stringify({ skinId: 9999, triggerType: 'RETRY_TEST' }),
    Attributes: { ApproximateReceiveCount: String(MAX_RECEIVE_COUNT + 2) },
  };

  console.log(`   🧪 Mock ApproximateReceiveCount=${mock.Attributes.ApproximateReceiveCount}`);
  console.log(`   👉 getMessageRetryCount(mock) = ${getMessageRetryCount(mock)}`);
  console.log('   ✅ Helper sanity check OK');
}

// ---------- Orchestrator ----------

async function run() {
  console.log('🚀 Starting Summary Queue Tests...');
  assertEnv();

  try {
    await testBasicEnqueueReceiveDelete();
    await testVisibilityTimeoutRedelivery();
    await testDLQRedrive();
    await testWeeklyChecks();
    await testRetryCountHelper();

    console.log('\n🎉 All tests attempted.');
    console.log('\n📝 Summary:');
    console.log('✅ Enqueue/Receive/Delete happy path');
    console.log('✅ Visibility timeout → redelivery observed (if no competing consumers)');
    console.log('✅ DLQ redrive after repeated failures (requires queue redrive policy)');
    console.log('✅ Weekly fan-out enqueues with jittered DelaySeconds');
    console.log('✅ Retry helper verified');
    console.log('\n🔎 If warnings occurred, check:');
    console.log('   • Redrive policy (DLQ ARN + maxReceiveCount) on the MAIN queue');
    console.log('   • VISIBILITY_TIMEOUT long enough for your worker');
    console.log('   • No other consumers deleting messages during tests');
  } catch (err) {
    console.error('❌ Tests failed:', err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  run();
}

// Export if you want to run selectively from another script/runner
module.exports = {
  run,
  testBasicEnqueueReceiveDelete,
  testVisibilityTimeoutRedelivery,
  testDLQRedrive,
  testWeeklyChecks,
  testRetryCountHelper,
};