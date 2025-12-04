const mongoose = require('mongoose');
const Skin = require('../models/Skin');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Random champion names for variety
const championNames = [
  'Ahri', 'Yasuo', 'Lux', 'Jinx', 'Darius', 'Thresh', 'Katarina', 'Lee Sin',
  'Vayne', 'Zed', 'Riven', 'Ezreal', 'Morgana', 'Garen', 'Ashe', 'Kha\'Zix',
  'Fizz', 'Orianna', 'Draven', 'Leona', 'Vi', 'Ziggs', 'Nami', 'Kennen',
  'Sona', 'Talon', 'Swain', 'Karma', 'Varus', 'Shen', 'Caitlyn', 'Malphite'
];

// Random skin names for variety
const skinNames = [
  'Cosmic Guardian', 'Shadow Assassin', 'Golden Phoenix', 'Crystal Frost',
  'Infernal Demon', 'Arcane Mystic', 'Steel Warrior', 'Ethereal Spirit',
  'Crimson Blade', 'Azure Storm', 'Obsidian Night', 'Emerald Dream',
  'Platinum Elite', 'Ruby Heart', 'Sapphire Soul', 'Diamond Crown',
  'Mystic Sage', 'Battle Commander', 'Royal Guard', 'Dark Knight',
  'Light Bringer', 'Storm Rider', 'Fire Walker', 'Ice Queen'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function addChampionSkin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate random champion and skin names
    const championName = getRandomElement(championNames);
    const skinName = getRandomElement(skinNames);

    // Create the skin document
    const skinDoc = {
      championId: championName,
      skinId: 100,
      name: skinName,
      rarity: 'kEpic', // Random rarity
      splashPath: `/champions/${championName.toLowerCase()}/skins/${skinName.toLowerCase().replace(/\s+/g, '_')}.jpg`,
      loadScreenPath: `/champions/${championName.toLowerCase()}/skins/${skinName.toLowerCase().replace(/\s+/g, '_')}_load.jpg`,
      skinLineId: Math.floor(Math.random() * 1000) + 1, // Random skin line ID
      description: `A magnificent ${skinName.toLowerCase()} skin for ${championName}, featuring stunning visual effects and unique animations.`,
      averageSplashRating: 0,
      averageModelRating: 0,
      totalNumberOfRatings: 0,
      totalNumberOfComments: 0,
      skinSummary: '',
      summaryGeneratedAt: null,
      dateCreated: new Date(),
      lastUpdated: new Date()
    };

    // Check if skin with skinId 100 already exists
    const existingSkin = await Skin.findOne({ skinId: 100 });
    
    if (existingSkin) {
      console.log(`Skin with skinId 100 already exists: ${existingSkin.name} for ${existingSkin.championId}`);
      console.log('Updating the existing skin...');
      
      // Update the existing skin
      await Skin.updateOne(
        { skinId: 100 },
        { $set: skinDoc }
      );
      console.log(`Updated skin: ${skinDoc.name} for ${skinDoc.championId} (skinId: ${skinDoc.skinId})`);
    } else {
      // Create new skin
      const newSkin = new Skin(skinDoc);
      await newSkin.save();
      console.log(`Added new skin: ${skinDoc.name} for ${skinDoc.championId} (skinId: ${skinDoc.skinId})`);
    }

    // Verify the skin was added/updated
    const savedSkin = await Skin.findOne({ skinId: 100 });
    console.log('Skin details:', {
      championId: savedSkin.championId,
      skinId: savedSkin.skinId,
      name: savedSkin.name,
      rarity: savedSkin.rarity,
      description: savedSkin.description
    });

  } catch (error) {
    console.error('Error adding champion skin:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addChampionSkin();
