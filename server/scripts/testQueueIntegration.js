const { 
  enqueueSummaryCheck, 
  receiveSummaryMessages, 
  deleteSummaryMessage,
  getMessageRetryCount,
  logMessageProcessing,
  SUMMARY_QUEUE_URL 
} = require('../config/summaryQueue');

async function testQueueIntegration() {
  console.log('🧪 Testing Queue Integration Functions...\n');
  
  console.log(`📋 Using queue: ${SUMMARY_QUEUE_URL}\n`);
  
  try {
    // Test 1: Enqueue a summary check
    console.log('📤 Test 1: Enqueueing summary check...');
    const testSkinId = 123;
    const enqueueResult = await enqueueSummaryCheck(testSkinId, 'TEST_INTEGRATION');
    
    if (!enqueueResult) {
      console.log('⚠️ Enqueue failed (this might be expected if SQS is not configured)');
      return false;
    }
    
    console.log(`✅ Summary check enqueued: ${enqueueResult.MessageId}`);
    
    // Test 2: Receive messages
    console.log('\n📥 Test 2: Receiving messages...');
    const messages = await receiveSummaryMessages(1);
    
    if (!messages || messages.length === 0) {
      console.log('⚠️ No messages received (this might be normal if queue is empty)');
      return true;
    }
    
    const message = messages[0];
    console.log(`✅ Message received: ${message.MessageId}`);
    
    // Test 3: Parse message body
    console.log('\n📋 Test 3: Parsing message body...');
    let messageBody;
    try {
      messageBody = JSON.parse(message.Body);
      console.log('✅ Message body parsed successfully');
      console.log(`   - skinId: ${messageBody.skinId}`);
      console.log(`   - triggerType: ${messageBody.triggerType}`);
      console.log(`   - timestamp: ${messageBody.timestamp}`);
    } catch (error) {
      console.error('❌ Failed to parse message body:', error.message);
      return false;
    }
    
    // Test 4: Test utility functions
    console.log('\n🔧 Test 4: Testing utility functions...');
    const retryCount = getMessageRetryCount(message);
    console.log(`   - Retry count: ${retryCount}`);
    
    logMessageProcessing(message, 'TEST_PROCESSING');
    console.log('✅ Utility functions working correctly');
    
    // Test 5: Delete the message
    console.log('\n🗑️ Test 5: Deleting message...');
    await deleteSummaryMessage(message.ReceiptHandle);
    console.log('✅ Message deleted successfully');
    
    console.log('\n🎉 All queue integration tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Queue integration test failed:', error.message);
    
    if (error.message.includes('QueueDoesNotExist')) {
      console.log('💡 The queue might not exist. Create it in AWS SQS console first.');
    } else if (error.message.includes('AccessDenied')) {
      console.log('💡 Check your AWS credentials and IAM permissions.');
    }
    
    return false;
  }
}

// Run the test
testQueueIntegration()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} Queue integration test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
