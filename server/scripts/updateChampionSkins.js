const mongoose = require('mongoose');
const path = require('path');
const skinManager = require('../utils/skinManager');

// Robustly load config.env from the parent directory
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Use the SkinManager to perform the sync
    const stats = await skinManager.syncSkins();
    
    console.log('Sync Stats:', stats);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);

  } catch (error) {
    console.error('Fatal Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

main();
