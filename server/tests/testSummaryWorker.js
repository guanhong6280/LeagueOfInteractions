// testSummaryWorker.js - Test the summary worker functionality
const { processSummaryMessage, shouldGenerateSummary, getCommentsForSummary, generateSummaryText } = require('../workers/summaryWorker');
const { enqueueSummaryCheck } = require('../config/summaryQueue');
const mongoose = require('mongoose');

// Test configuration
const TEST_SKIN_ID = 1; // Use a skin that exists in your database

/**
 * Test dual-trigger logic with different scenarios
 */
function testDualTriggerLogic() {
  console.log('\n🧪 Testing Dual-Trigger Logic...\n');
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  
  const testCases = [
    {
      name: 'Threshold trigger (5+ comments)',
      skin: { summaryGeneratedAt: now },
      commentCount: 5,
      expected: true
    },
    {
      name: 'Threshold trigger (10 comments)',
      skin: { summaryGeneratedAt: now },
      commentCount: 10,
      expected: true
    },
    {
      name: 'Time trigger (7+ days, 1+ comment)',
      skin: { summaryGeneratedAt: eightDaysAgo },
      commentCount: 1,
      expected: true
    },
    {
      name: 'Time trigger (7+ days, 3 comments)',
      skin: { summaryGeneratedAt: eightDaysAgo },
      commentCount: 3,
      expected: true
    },
    {
      name: 'First summary (any comments)',
      skin: { summaryGeneratedAt: null },
      commentCount: 1,
      expected: true
    },
    {
      name: 'No trigger (4 comments, recent summary)',
      skin: { summaryGeneratedAt: now },
      commentCount: 4,
      expected: false
    },
    {
      name: 'No trigger (0 comments, old summary)',
      skin: { summaryGeneratedAt: eightDaysAgo },
      commentCount: 0,
      expected: false
    },
    {
      name: 'No trigger (6 days, 2 comments)',
      skin: { summaryGeneratedAt: sevenDaysAgo },
      commentCount: 2,
      expected: false
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = shouldGenerateSummary(testCase.skin, testCase.commentCount);
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${status} ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
    
    if (result === testCase.expected) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

/**
 * Test message processing with a mock message
 */
async function testMessageProcessing() {
  console.log('\n🧪 Testing Message Processing...\n');
  
  try {
    // Create a mock SQS message
    const mockMessage = {
      MessageId: 'test-message-123',
      ReceiptHandle: 'test-receipt-handle',
      Body: JSON.stringify({
        skinId: TEST_SKIN_ID,
        triggerType: 'NEW_COMMENT',
        timestamp: new Date().toISOString()
      }),
      Attributes: {
        ApproximateReceiveCount: '1'
      }
    };
    
    console.log(`📨 Processing mock message for skin ${TEST_SKIN_ID}...`);
    
    // Note: This will actually try to process a real skin from your database
    // Make sure TEST_SKIN_ID exists and has comments
    const result = await processSummaryMessage(mockMessage);
    
    console.log(`✅ Message processing result: ${result ? 'SUCCESS' : 'FAILED'}`);
    return result;
    
  } catch (error) {
    console.error('❌ Message processing test failed:', error.message);
    return false;
  }
}

/**
 * Test comment retrieval
 */
async function testCommentRetrieval() {
  console.log('\n🧪 Testing Comment Retrieval...\n');
  
  try {
    // Test getting comments since a specific date
    const testDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const comments = await getCommentsForSummary(TEST_SKIN_ID, testDate);
    
    console.log(`📝 Found ${comments.length} comments since ${testDate.toISOString()}`);
    
    if (comments.length > 0) {
      console.log('Sample comment:', {
        content: comments[0].content.substring(0, 50) + '...',
        status: comments[0].status,
        createdAt: comments[0].createdAt
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Comment retrieval test failed:', error.message);
    return false;
  }
}

/**
 * Test summary generation with sample comment texts
 */
async function testSummaryGeneration() {
  console.log('\n🧪 Testing Summary Generation...\n');
  
  try {
    const sampleTexts = [
      'This skin looks amazing! The visual effects are stunning.',
      'The splash art is beautiful and the in-game model is well designed.',
      'Great value for money, definitely worth the RP.',
      'The animations are smooth and the particles are eye-catching.',
      'One of the best skins for this champion, highly recommended!'
    ];
    
    console.log(`🤖 Generating summary from ${sampleTexts.length} sample texts...`);
    
    const summary = await generateSummaryText(sampleTexts);
    
    console.log(`✅ Summary generated (${summary.length} characters):`);
    console.log(`"${summary}"`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Summary generation test failed:', error.message);
    return false;
  }
}

/**
 * Test queue integration
 */
async function testQueueIntegration() {
  console.log('\n🧪 Testing Queue Integration...\n');
  
  try {
    console.log(`📤 Enqueueing test message for skin ${TEST_SKIN_ID}...`);
    
    const result = await enqueueSummaryCheck(TEST_SKIN_ID, 'TEST_TRIGGER');
    
    console.log(`✅ Message enqueued successfully: ${result.MessageId}`);
    console.log('📋 You can now run the worker to process this message:');
    console.log('   cd server && node workers/summaryWorker.js');
    
    return true;
    
  } catch (error) {
    console.error('❌ Queue integration test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Summary Worker Tests...\n');
  
  // Test 1: Dual-trigger logic (no database required)
  const triggerTestPassed = testDualTriggerLogic();
  
  // Test 2: Summary generation (requires AWS Bedrock)
  const summaryTestPassed = await testSummaryGeneration();
  
  // Test 3: Comment retrieval (requires database)
  const commentTestPassed = await testCommentRetrieval();
  
  // Test 4: Queue integration (requires AWS SQS)
  const queueTestPassed = await testQueueIntegration();
  
  // Test 5: Message processing (requires everything)
  const messageTestPassed = await testMessageProcessing();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Dual-trigger logic: ${triggerTestPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Summary generation: ${summaryTestPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Comment retrieval: ${commentTestPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Queue integration: ${queueTestPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Message processing: ${messageTestPassed ? 'PASS' : 'FAIL'}`);
  
  const allPassed = triggerTestPassed && summaryTestPassed && commentTestPassed && queueTestPassed && messageTestPassed;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your worker is ready to run.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  return allPassed;
}

// Run tests if called directly
if (require.main === module) {
  // Connect to database
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leagueOfInteractions')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return runAllTests();
    })
    .then((success) => {
      if (success) {
        console.log('\n🚀 Ready to start the worker!');
      } else {
        console.log('\n🔧 Please fix the failing tests before running the worker.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    })
    .finally(() => {
      mongoose.disconnect();
    });
}

module.exports = {
  testDualTriggerLogic,
  testMessageProcessing,
  testCommentRetrieval,
  testSummaryGeneration,
  testQueueIntegration,
  runAllTests
};
