const express = require('express');
const router = express.Router();
const championStatsController = require('../controllers/championStatsController');

/**
 * GET /api/champions/stats
 * Get aggregated statistics for all champions
 * Returns champion-level stats including total skins, ratings, comments, etc.
 */
router.get('/stats', championStatsController.getChampionStats);

/**
 * GET /api/champions/:championName/stats
 * Get detailed statistics for a specific champion
 * Returns champion-specific stats including rating distribution, popular skins, etc.
 */
router.get('/:championName/stats', championStatsController.getChampionSpecificStats);

module.exports = router; 