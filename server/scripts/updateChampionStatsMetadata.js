const axios = require('axios');
const mongoose = require('mongoose');
const ChampionStats = require('../models/ChampionStats');
require('dotenv').config();

// MongoDB connection string (update as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/league_interactions'; // fallback for local testing

async function getAllChampionIds() {
  const url = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json';
  const response = await axios.get(url);
  // Filter out -1 (random) if present
  return response.data.filter(c => c.id !== -1).map((champ) => champ.id);
}

async function fetchChampionData(championId) {
  const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${championId}.json`;
  const response = await axios.get(url);
  return response.data;
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'leagueOfInteractions', // Explicitly set the database name
    });
    console.log('Connected to MongoDB (leagueOfInteractions)');

    const championIds = await getAllChampionIds();
    console.log(`Found ${championIds.length} champion IDs`);

    for (const championId of championIds) {
      try {
        const championData = await fetchChampionData(championId);
        
        // "name" in the JSON is the display name (e.g. "Wukong").
        // "alias" is the internal name (e.g. "MonkeyKing").
        // The user's skin data model uses display names (e.g. "Lee Sin", "Wukong"),
        // so we use championData.name to ensure consistency with the skin model's championId.
        
        const championName = championData.name; // Changed from alias to name for consistency

        const updateDoc = {
            title: championData.title,
            roles: championData.roles,
            damageType: championData.tacticalInfo?.damageType,
            playstyleInfo: {
                damage: championData.playstyleInfo?.damage,
                durability: championData.playstyleInfo?.durability,
                crowdControl: championData.playstyleInfo?.crowdControl,
                mobility: championData.playstyleInfo?.mobility,
                utility: championData.playstyleInfo?.utility,
            }
        };

        // Upsert: update if exists, insert if not
        // Note: If the champion doesn't exist in stats yet, this creates it with 0 ratings.
        await ChampionStats.updateOne(
          { championId: championName },
          { $set: updateDoc },
          { upsert: true }
        );
        
        console.log(`Updated stats metadata for: ${championName}`);

      } catch (err) {
        // Some IDs might be test champions or removed, just log and continue
        console.error(`Error processing championId ${championId}: ${err.message}`);
      }
    }

    console.log('Done updating champion stats metadata!');

  } catch (err) {
    console.error('Script failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();

