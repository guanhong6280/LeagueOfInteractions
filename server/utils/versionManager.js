const axios = require('axios');

class VersionManager {
  constructor() {
    this.currentVersion = null;
    this.lastVersionCheck = null;
    this.versionCheckInterval = 3 * 24 * 60 * 60 * 1000; // 3 days (to catch hotfixes)
    this.fallbackVersion = '14.18.1';
    this.cache = new Map();
    this.cacheExpiry = 14 * 24 * 60 * 60 * 1000; // 2 weeks cache expiry
  }

  /**
   * Get the latest version from Riot's API
   * @returns {Promise<string>} Latest version string
   */
  async getLatestVersion() {
    const now = Date.now();
    
    // Check if we need to refresh the version
    if (!this.currentVersion || 
        !this.lastVersionCheck || 
        now - this.lastVersionCheck > this.versionCheckInterval) {
      
      try {
        console.log('Fetching latest League of Legends version...');
        const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json', {
          timeout: 5000, // 5 second timeout
        });
        
        if (response.data && response.data.length > 0) {
          this.currentVersion = response.data[0];
          this.lastVersionCheck = now;
          console.log(`Updated to League version: ${this.currentVersion}`);
        } else {
          throw new Error('Invalid version response');
        }
      } catch (error) {
        console.error('Failed to fetch latest version:', error.message);
        
        // If we don't have a cached version, use fallback
        if (!this.currentVersion) {
          this.currentVersion = this.fallbackVersion;
          console.log(`Using fallback version: ${this.fallbackVersion}`);
        } else {
          console.log(`Using cached version: ${this.currentVersion}`);
        }
      }
    }
    
    return this.currentVersion || this.fallbackVersion;
  }

  /**
   * Get champion data specifically
   * @param {string} language - Language code (default: 'en_US')
   * @returns {Promise<Object>} Champion data
   */
  async getChampionData(language = 'en_US') {
    const cacheKey = `champion_${language}`;
    const cached = this.cache.get(cacheKey);
    
    // Check cache first
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`Returning cached champion data for ${language}`);
      return cached.data;
    }

    try {
      const version = await this.getLatestVersion();
      const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`;
      
      console.log(`Fetching champion data from: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
      });
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      
      console.log(`Successfully fetched and cached champion data for ${language}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch champion data:`, error.message);
      throw new Error(`Failed to fetch champion data: ${error.message}`);
    }
  }

  /**
   * Get specific champion data with full details
   * @param {string} championName - Champion name (e.g., 'Ahri', 'Yasuo')
   * @param {string} language - Language code (default: 'en_US')
   * @returns {Promise<Object>} Specific champion data with full details
   */
  async getChampionSpecificData(championName, language = 'en_US') {
    const cacheKey = `champion_specific_${championName}_${language}`;
    const cached = this.cache.get(cacheKey);
    
    // Check cache first
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`Returning cached specific champion data for ${championName}`);
      return cached.data;
    }

    try {
      const version = await this.getLatestVersion();
      const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion/${championName}.json`;
      
      console.log(`Fetching specific champion data for ${championName} from: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
      });
      
      // Extract the specific champion data
      const championData = response.data.data[championName];
      
      if (!championData) {
        throw new Error(`Champion ${championName} not found in response`);
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: championData,
        timestamp: Date.now(),
      });
      
      console.log(`Successfully fetched and cached specific champion data for ${championName}`);
      return championData;
    } catch (error) {
      console.error(`Failed to fetch specific champion data for ${championName}:`, error.message);
      throw new Error(`Failed to fetch specific champion data for ${championName}: ${error.message}`);
    }
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache() {
    this.cache.clear();
    this.currentVersion = null;
    this.lastVersionCheck = null;
    console.log('Version manager cache cleared');
  }

  /**
   * Get current version info
   * @returns {Object} Version info object
   */
  getVersionInfo() {
    return {
      currentVersion: this.currentVersion,
      lastCheck: this.lastVersionCheck,
      fallbackVersion: this.fallbackVersion,
      cacheSize: this.cache.size,
    };
  }
}

// Export singleton instance
module.exports = new VersionManager(); 