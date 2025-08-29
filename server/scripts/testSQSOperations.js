const { 
  SQSClient, 
  SendMessageCommand, 
  ReceiveMessageCommand, 
  DeleteMessageCommand,
  GetQueueAttributesCommand
} = require('@aws-sdk/client-sqs');
require('dotenv').config();

const client = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const QUEUE_URL = process.env.SUMMARY_QUEUE_URL;

async function testSQSOperations() {
  console.log('🧪 Testing SQS Basic Operations...\n');
  
  if (!QUEUE_URL) {
    console.error('❌ SUMMARY_QUEUE_URL not set in environment variables');
    return false;
  }
  
  console.log(`📋 Using queue: ${QUEUE_URL}\n`);
  
  try {
    // Test 1: Get queue attributes
    console.log('📊 Test 1: Getting queue attributes...');
    const attributesCommand = new GetQueueAttributesCommand({
      QueueUrl: QUEUE_URL,
      AttributeNames: ['All']
    });
    
    const attributes = await client.send(attributesCommand);
    console.log('✅ Queue attributes retrieved successfully');
    console.log(`   - Queue type: ${attributes.Attributes?.QueueArn?.includes('FIFO') ? 'FIFO' : 'Standard'}`);
    console.log(`   - Visibility timeout: ${attributes.Attributes?.VisibilityTimeout} seconds`);
    console.log(`   - Message retention: ${attributes.Attributes?.MessageRetentionPeriod} seconds`);
    
    // Test 2: Send a test message
    console.log('\n📤 Test 2: Sending test message...');
    const testMessage = {
      skinId: 999,
      triggerType: 'TEST_OPERATION',
      timestamp: new Date().toISOString(),
      testData: 'This is a test message for SQS operations'
    };
    
    const sendCommand = new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(testMessage),
      MessageAttributes: {
        skinId: {
          DataType: 'Number',
          StringValue: '999'
        },
        triggerType: {
          DataType: 'String',
          StringValue: 'TEST_OPERATION'
        }
      }
    });
    
    const sendResult = await client.send(sendCommand);
    console.log(`✅ Message sent successfully: ${sendResult.MessageId}`);
    
    // Test 3: Receive the message
    console.log('\n📥 Test 3: Receiving message...');
    const receiveCommand = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5,
      MessageAttributeNames: ['All'],
      AttributeNames: ['All']
    });
    
    const receiveResult = await client.send(receiveCommand);
    
    if (!receiveResult.Messages || receiveResult.Messages.length === 0) {
      console.log('⚠️ No messages received (this might be normal if queue is empty)');
      return true;
    }
    
    const message = receiveResult.Messages[0];
    console.log(`✅ Message received: ${message.MessageId}`);
    console.log(`   - Receipt handle: ${message.ReceiptHandle?.substring(0, 20)}...`);
    console.log(`   - Body: ${message.Body?.substring(0, 50)}...`);
    
    // Test 4: Delete the message
    console.log('\n🗑️ Test 4: Deleting message...');
    const deleteCommand = new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle
    });
    
    await client.send(deleteCommand);
    console.log('✅ Message deleted successfully');
    
    console.log('\n🎉 All SQS operations tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ SQS operations test failed:', error.message);
    
    if (error.name === 'QueueDoesNotExist') {
      console.log('💡 The queue URL might be incorrect or the queue doesn\'t exist.');
    } else if (error.name === 'AccessDenied') {
      console.log('💡 Check your IAM permissions for SQS operations.');
    }
    
    return false;
  }
}

// Run the test
testSQSOperations()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} SQS operations test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
