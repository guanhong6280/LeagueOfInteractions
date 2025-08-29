const { SQSClient, ListQueuesCommand } = require('@aws-sdk/client-sqs');
require('dotenv').config();

async function testSQSEnvironment() {
  console.log('🔧 Testing SQS Environment Setup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'NOT SET'}`);
  console.log(`   SUMMARY_QUEUE_URL: ${process.env.SUMMARY_QUEUE_URL || 'NOT SET'}`);
  console.log(`   SUMMARY_DLQ_URL: ${process.env.SUMMARY_DLQ_URL || 'NOT SET'}`);
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);
  
  // Test AWS credentials
  try {
    console.log('\n🔐 Testing AWS Credentials...');
    const client = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });
    
    const command = new ListQueuesCommand({});
    const result = await client.send(command);
    
    console.log('✅ AWS credentials are valid!');
    console.log(`📊 Found ${result.QueueUrls?.length || 0} SQS queues in your account`);
    
    if (result.QueueUrls) {
      console.log('📋 Available queues:');
      result.QueueUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ AWS credentials test failed:', error.message);
    
    if (error.name === 'UnauthorizedOperation') {
      console.log('💡 This might be a permissions issue. Check your IAM policies.');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.log('💡 Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
    }
    
    return false;
  }
}

// Run the test
testSQSEnvironment()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} Environment test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
