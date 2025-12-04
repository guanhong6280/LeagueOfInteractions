const axios = require('axios');
const Skin = require('../models/Skin');

class SkinManager {
  constructor() {
    this.baseUrl = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1';
  }

  /**
   * Fetch list of all champions with their IDs
   * @returns {Promise<Array<number>>} Array of champion IDs
   */
  async getAllChampionIds() {
    try {
      const url = `${this.baseUrl}/champion-summary.json`;
      const response = await axios.get(url);
      return response.data.map((champ) => champ.id);
    } catch (error) {
      console.error('Failed to fetch champion summary:', error.message);
      throw error;
    }
  }

  /**
   * Fetch detailed data for a specific champion
   * @param {number} championId 
   * @returns {Promise<Object>} Champion data
   */
  async fetchChampionData(championId) {
    try {
      const url = `${this.baseUrl}/champions/${championId}.json`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch data for champion ${championId}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync skins for all champions or a specific champion from CommunityDragon to the database.
   * @param {number} [targetChampionId] - Optional: specific champion ID to sync
   * @returns {Promise<{ totalProcessed: number, totalUpdated: number, errors: Array }>} Stats
   */
  async syncSkins(targetChampionId = null) {
    console.log('Starting skin synchronization...');
    const stats = {
      totalProcessed: 0,
      totalUpdated: 0,
      errors: []
    };

    try {
      let championIds = [];
      
      if (targetChampionId) {
        championIds = [targetChampionId];
      } else {
        championIds = await this.getAllChampionIds();
      }

      console.log(`Found ${championIds.length} champion(s) to process.`);

      for (const championId of championIds) {
        try {
          const championData = await this.fetchChampionData(championId);
          const championName = championData.name;

          if (!championData.skins) continue;

          for (const skin of championData.skins) {
            stats.totalProcessed++;
            
            const skinDoc = {
              championId: championName,
              skinId: skin.id,
              name: skin.name,
              rarity: skin.rarity || 'kNoRarity',
              splashPath: skin.splashPath || '',
              loadScreenPath: skin.loadScreenPath || '',
              skinLineId: skin.skinLines && skin.skinLines.length > 0 ? skin.skinLines[0].id : undefined,
              description: skin.description || '',
              lastUpdated: new Date()
            };

            // Upsert: update if exists, insert if not
            // Using setDefaultsOnInsert to ensure default fields (like ratings) are set on creation
            await Skin.updateOne(
              { skinId: skinDoc.skinId },
              { 
                $set: skinDoc,
                $setOnInsert: { 
                  dateCreated: new Date(),
                  averageSplashRating: 0,
                  averageModelRating: 0,
                  totalNumberOfRatings: 0, 
                  totalNumberOfComments: 0
                }
              },
              { upsert: true }
            );
            
            stats.totalUpdated++;
          }
          // Optional: Add a small delay to be nice to the API
          // await new Promise(resolve => setTimeout(resolve, 50)); 
          
        } catch (err) {
          console.error(`Error processing championId ${championId}:`, err.message);
          stats.errors.push({ championId, error: err.message });
        }
      }

      console.log('Skin synchronization complete.');
      return stats;

    } catch (error) {
      console.error('Fatal error in syncSkins:', error);
      throw error;
    }
  }
}

module.exports = new SkinManager();

