const axios = require('axios');
const Skin = require('../models/Skin');

class SkinManager {
  constructor() {
    this.baseUrl = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1';
    this.progress = this._createInitialProgress();
  }

  _createInitialProgress() {
    return {
      status: 'idle',
      totalChampions: 0,
      processedChampions: 0,
      errors: [],
      startedAt: null,
      endedAt: null,
      message: ''
    };
  }

  getProgress() {
    return this.progress;
  }

  isSyncInProgress() {
    return this.progress.status === 'running';
  }

  /**
   * Fetch list of all champions with their IDs
   * @returns {Promise<Array<number>>} Array of champion IDs
   */
  async getAllChampionIds() {
    try {
      const url = `${this.baseUrl}/champion-summary.json`;
      const response = await axios.get(url);
      // Filter out special-mode bots (e.g., Doom Bots) so we do not import them
      const validChampions = response.data.filter(
        (champ) => !champ.name || !champ.name.toLowerCase().startsWith('doom bot')
      );
      return validChampions.map((champ) => champ.id);
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
    if (this.isSyncInProgress()) {
      throw new Error('Skin sync is already running.');
    }

    console.log('Starting skin synchronization...');

    try {
      let championIds = [];
      
      if (targetChampionId) {
        championIds = [targetChampionId];
      } else {
        championIds = await this.getAllChampionIds();
      }

      console.log(`Found ${championIds.length} champion(s) to process.`);
      this.progress = {
        status: 'running',
        totalChampions: championIds.length,
        processedChampions: 0,
        errors: [],
        startedAt: new Date(),
        endedAt: null,
        message: ''
      };

      for (const championId of championIds) {
        try {
          const championData = await this.fetchChampionData(championId);
          const championName = championData.name;

          // Skip Doom Bot variants defensively in case they slip through
          if (championName && championName.toLowerCase().startsWith('doom bot')) {
            console.log(`Skipping Doom Bot entry: ${championName} (${championId})`);
            this.progress.processedChampions++;
            continue;
          }

          if (!championData.skins || championData.skins.length === 0) {
            this.progress.processedChampions++;
            continue;
          }

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
            
          }
          this.progress.processedChampions++;
          // Optional: Add a small delay to be nice to the API
          // await new Promise(resolve => setTimeout(resolve, 50)); 
          
        } catch (err) {
          console.error(`Error processing championId ${championId}:`, err.message);
          this.progress.errors.push({ championId, error: err.message });
          this.progress.processedChampions++;
        }
      }

      console.log('Skin synchronization complete.');
      this.progress.status = 'completed';
      this.progress.endedAt = new Date();
      this.progress.message = 'Skin synchronization completed.';
      return this.progress;

    } catch (error) {
      console.error('Fatal error in syncSkins:', error);
      this.progress.status = 'error';
      this.progress.endedAt = new Date();
      this.progress.message = error.message || 'Fatal error during sync.';
      throw error;
    }
  }
}

module.exports = new SkinManager();

