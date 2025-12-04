const mongoose = require('mongoose');
const ChampionStats = require('../models/ChampionStats');
require('dotenv').config({ path: '../.env' }); // Load env vars from .env in parent dir

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/league_interactions';

async function deleteDoomBots() {
  try {
    await mongoose.connect(MONGODB_URI, {
        dbName: 'leagueOfInteractions',
    });
    console.log('Connected to MongoDB');

    // Find and delete documents where championId contains "Doom Bot" (case-insensitive)
    const result = await ChampionStats.deleteMany({ 
      championId: { $regex: /Doom Bot/i } 
    });

    console.log(`Deleted ${result.deletedCount} documents containing "Doom Bot"`);

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteDoomBots();

