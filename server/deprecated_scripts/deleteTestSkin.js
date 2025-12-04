const mongoose = require('mongoose');
const Skin = require('../models/Skin');
require('dotenv').config({ path: '../config.env' }); // Adjust path to config.env if needed, usually in server root

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

async function deleteTestSkin() {
  try {
    // Connect to MongoDB
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // The skinId used in the addChampionSkin.js script was 100
    const targetSkinId = 100;

    // Check if the skin exists
    const existingSkin = await Skin.findOne({ skinId: targetSkinId });

    if (!existingSkin) {
      console.log(`No skin found with skinId: ${targetSkinId}. Nothing to delete.`);
    } else {
      console.log(`Found skin: ${existingSkin.name} for ${existingSkin.championId} (skinId: ${targetSkinId})`);
      
      // Delete the skin
      const result = await Skin.deleteOne({ skinId: targetSkinId });
      
      if (result.deletedCount === 1) {
        console.log(`Successfully deleted skin with skinId: ${targetSkinId}`);
      } else {
        console.log(`Failed to delete skin with skinId: ${targetSkinId}`);
      }
    }

  } catch (error) {
    console.error('Error deleting champion skin:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
deleteTestSkin();

