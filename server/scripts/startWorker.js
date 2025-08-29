// startWorker.js - Start the summary worker
const { runWorker } = require('../workers/summaryWorker');
const mongoose = require('mongoose');
require('dotenv').config();

async function startWorker() {
  console.log('🚀 Starting Summary Worker...\n');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leagueOfInteractions';
    console.log(`📦 Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Check environment variables
    const requiredEnvVars = ['SUMMARY_QUEUE_URL', 'AWS_REGION'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('The worker may not function correctly without these variables.');
    } else {
      console.log('✅ Environment variables configured');
    }
    
    console.log('\n🎯 Worker Configuration:');
    console.log(`   - Queue URL: ${process.env.SUMMARY_QUEUE_URL || 'NOT SET'}`);
    console.log(`   - AWS Region: ${process.env.AWS_REGION || 'NOT SET'}`);
    console.log(`   - Database: ${mongoose.connection.name}`);
    
    console.log('\n🔄 Starting worker loop...');
    console.log('Press Ctrl+C to stop the worker gracefully\n');
    
    // Start the worker
    await runWorker();
    
  } catch (error) {
    console.error('💥 Failed to start worker:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('📦 Disconnected from MongoDB');
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the worker
startWorker();
