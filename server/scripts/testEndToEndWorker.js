const mongoose = require('mongoose');
const { enqueueSummaryCheck, receiveSummaryMessages, deleteSummaryMessage } = require('../config/summaryQueue');
const { processSummaryMessage } = require('../workers/summaryWorker');
const Skin = require('../models/Skin');
const SkinComment = require('../models/SkinComment');
const User = require('../models/User');
require('dotenv').config();

// Test configuration
const TEST_SKIN_ID = 999; // Use a test skin ID

async function createOrGetTestUsers(count = 5) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const username = `e2e_test_user_${i + 1}`;
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({
        username,
        email: `${username}@example.com`
      });
      await user.save();
    }
    users.push(user);
  }
  return users;
}

async function setupTestData() {
  console.log('🔧 Setting up test data...\n');
  
  try {
    // Create a test skin if it doesn't exist
    const existingSkin = await Skin.findOne({ skinId: TEST_SKIN_ID });
    if (!existingSkin) {
      const testSkin = new Skin({
        championId: 'TestChampion',
        skinId: TEST_SKIN_ID,
        name: 'Test Skin',
        rarity: 'kEpic',
        splashPath: '/test/splash.jpg',
        loadScreenPath: '/test/load.jpg',
        description: 'A test skin for testing purposes',
        skinSummary: 'Initial test summary',
        summaryGeneratedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      });
      await testSkin.save();
      console.log('✅ Test skin created');
    } else {
      console.log('✅ Test skin already exists');
    }

    // Ensure we have distinct users for unique (skinId, userId)
    const users = await createOrGetTestUsers(5);
    
    // Create test comments (one per user)
    const baseComments = [
      'This test skin looks amazing! The visual effects are stunning.',
      'Great value for money, definitely worth the RP.',
      'The animations are smooth and the particles are eye-catching.',
      'One of the best skins for this champion, highly recommended!',
      'The splash art is beautiful and the in-game model is well designed.'
    ];

    for (let i = 0; i < baseComments.length; i++) {
      const user = users[i];
      const existingComment = await SkinComment.findOne({ skinId: TEST_SKIN_ID, userId: user._id });
      if (!existingComment) {
        const comment = new SkinComment({
          skinId: TEST_SKIN_ID,
          userId: user._id,
          username: user.username,
          comment: baseComments[i],
          status: 'approved'
        });
        await comment.save();
      }
    }
    
    console.log('✅ Test comments created/verified');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to setup test data:', error.message);
    return false;
  }
}

async function testEndToEndWorker() {
  console.log('🧪 Testing End-to-End Worker Process...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leagueOfInteractions');
    console.log('📦 Connected to MongoDB');
    
    // Setup test data
    const setupSuccess = await setupTestData();
    if (!setupSuccess) {
      throw new Error('Failed to setup test data');
    }
    
    // Step 1: Enqueue a summary check (optional)
    console.log('\n📤 Step 1: Enqueueing summary check...');
    const enqueueResult = await enqueueSummaryCheck(TEST_SKIN_ID, 'TEST_E2E');
    if (enqueueResult) {
      console.log(`✅ Summary check enqueued: ${enqueueResult.MessageId}`);
    } else {
      console.log('ℹ️ Skipping real queue receive/delete in this test run');
    }
    
    // Step 2: Create a mock message for testing
    console.log('\n📨 Step 2: Creating mock message...');
    const mockMessage = {
      MessageId: 'test-e2e-message-123',
      ReceiptHandle: 'test-e2e-receipt-handle',
      Body: JSON.stringify({
        skinId: TEST_SKIN_ID,
        triggerType: 'TEST_E2E',
        timestamp: new Date().toISOString()
      }),
      Attributes: {
        ApproximateReceiveCount: '1'
      }
    };
    
    console.log(`✅ Mock message created for skin ${TEST_SKIN_ID}`);
    
    // Step 3: Process the message
    console.log('\n🔄 Step 3: Processing message...');
    const startTime = Date.now();
    const processResult = await processSummaryMessage(mockMessage);
    const endTime = Date.now();
    
    console.log(`✅ Message processing completed in ${endTime - startTime}ms`);
    console.log(`   Result: ${processResult ? 'SUCCESS' : 'FAILED'}`);
    
    // Step 4: Verify the results
    console.log('\n📊 Step 4: Verifying results...');
    const updatedSkin = await Skin.findOne({ skinId: TEST_SKIN_ID });
    
    if (updatedSkin) {
      console.log('✅ Skin found in database');
      console.log(`   - Summary generated at: ${updatedSkin.summaryGeneratedAt}`);
      console.log(`   - Summary length: ${updatedSkin.skinSummary?.length || 0} characters`);
      console.log(`   - Summary preview: ${(updatedSkin.skinSummary || '').slice(0, 120)}...`);
    } else {
      console.log('❌ Skin not found in database');
    }
    
    console.log('\n🎉 End-to-end worker test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ End-to-end worker test failed:', error.message);
    return false;
  } finally {
    // Cleanup
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('📦 Disconnected from MongoDB');
    }
  }
}

// Run the test
testEndToEndWorker()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} End-to-end worker test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
