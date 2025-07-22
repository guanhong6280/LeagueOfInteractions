// server/routes/championDataRoutes.js
const express = require('express');
const router = express.Router();
const versionManager = require('../utils/versionManager');

// GET /champion_names - Get all champion data
router.get('/champion_names', async (req, res) => {
  try {
    const language = req.query.language || 'en_US';
    const championData = await versionManager.getChampionData(language);
    
    res.json(championData);
  } catch (error) {
    console.error('Error fetching champion data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch champion data',
      message: error.message 
    });
  }
});

// GET /champion_names/list - Get simplified champion list (just names and keys)
router.get('/champion_names/list', async (req, res) => {
  try {
    const language = req.query.language || 'en_US';
    const championData = await versionManager.getChampionData(language);
    
    // Transform data to a simpler format
    const championList = Object.values(championData.data).map(champion => ({
      id: champion.id,
      key: champion.key,
      name: champion.name,
      title: champion.title,
      image: champion.image,
      tags: champion.tags,
    }));
    
    res.json({
      type: championData.type,
      version: championData.version,
      champions: championList,
    });
  } catch (error) {
    console.error('Error fetching champion list:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch champion list',
      message: error.message 
    });
  }
});

// GET /champion/:championId - Get specific champion data
router.get('/champion/:championId', async (req, res) => {
  try {
    const { championId } = req.params;
    const language = req.query.language || 'en_US';
    const championData = await versionManager.getChampionData(language);
    
    const champion = championData.data[championId];
    
    if (!champion) {
      return res.status(404).json({ 
        error: 'Champion not found',
        championId: championId 
      });
    }
    
    res.json(champion);
  } catch (error) {
    console.error('Error fetching champion:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch champion',
      message: error.message 
    });
  }
});

// GET /items - Get all item data
router.get('/items', async (req, res) => {
  try {
    const language = req.query.language || 'en_US';
    const itemData = await versionManager.getItemData(language);
    
    res.json(itemData);
  } catch (error) {
    console.error('Error fetching item data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch item data',
      message: error.message 
    });
  }
});

// GET /summoner-spells - Get summoner spell data
router.get('/summoner-spells', async (req, res) => {
  try {
    const language = req.query.language || 'en_US';
    const summonerData = await versionManager.getSummonerSpellData(language);
    
    res.json(summonerData);
  } catch (error) {
    console.error('Error fetching summoner spell data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch summoner spell data',
      message: error.message 
    });
  }
});

// GET /version - Get current version info
router.get('/version', async (req, res) => {
  try {
    const version = await versionManager.getLatestVersion();
    const versionInfo = versionManager.getVersionInfo();
    
    res.json({
      currentVersion: version,
      ...versionInfo,
    });
  } catch (error) {
    console.error('Error fetching version:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch version',
      message: error.message 
    });
  }
});

// POST /cache/clear - Clear cache (useful for development/testing)
router.post('/cache/clear', (req, res) => {
  try {
    versionManager.clearCache();
    res.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error.message 
    });
  }
});

// GET /health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const version = await versionManager.getLatestVersion();
    const versionInfo = versionManager.getVersionInfo();
    
    res.json({
      status: 'healthy',
      service: 'Champion Data API',
      version: version,
      cache: {
        size: versionInfo.cacheSize,
        lastVersionCheck: versionInfo.lastCheck ? new Date(versionInfo.lastCheck).toISOString() : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
