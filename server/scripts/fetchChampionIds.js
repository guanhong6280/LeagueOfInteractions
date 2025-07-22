const axios = require('axios');
const mongoose = require('mongoose');
const Skin = require('../models/Skin');
require('dotenv').config();
// MongoDB connection string (update as needed)
const MONGODB_URI = process.env.MONGODB_URI;

async function getAllChampionIds() {
  const url = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json';
  const response = await axios.get(url);
  return response.data.map((champ) => champ.id);
}

async function fetchChampionData(championId) {
  const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${championId}.json`;
  const response = await axios.get(url);
  return response.data;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const championIds = await getAllChampionIds();
  console.log(`Found ${championIds.length} champion IDs`);

  for (const championId of championIds) {
    try {
      const championData = await fetchChampionData(championId);
      const championName = championData.name;

      for (const skin of championData.skins) {
        const skinDoc = {
          championId: championName,
          skinId: skin.id,
          name: skin.name,
          rarity: skin.rarity || 'kNoRarity',
          splashPath: skin.splashPath || '',
          loadScreenPath: skin.loadScreenPath || '',
          skinLineId: skin.skinLines && skin.skinLines.length > 0 ? skin.skinLines[0].id : undefined,
          description: skin.description || '',
        };

        // Upsert: update if exists, insert if not
        await Skin.updateOne(
          { skinId: skinDoc.skinId },
          { $set: skinDoc },
          { upsert: true },
        );
        console.log(`Upserted skin: ${skinDoc.name} (${skinDoc.skinId})`);
      }
    } catch (err) {
      console.error(`Error processing championId ${championId}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

main();
