const Skin = require('../../models/Skin');
const skinManager = require('../../utils/skinManager');

/**
 * Get all skins, with optional filters.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllSkins = async (req, res) => {
  try {
    const { championName, skinLineId } = req.query;
    const filter = {};

    // Add filters if provided
    if (championName) {
      filter.championName = championName;
    }
    if (skinLineId) {
      filter.skinLineId = Number(skinLineId);
    }

    const skins = await Skin.find(filter);
    
    res.json({
      success: true,
      count: skins.length,
      data: skins,
    });
  } catch (err) {
    console.error('Error fetching skins:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skins.',
      message: err.message,
    });
  }
};

/**
 * Get a single skin by skinId.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSkinById = async (req, res) => {
  try {
    const { skinId } = req.params;
    const skin = await Skin.findOne({ skinId: Number(skinId) });

    if (!skin) {
      return res.status(404).json({
        success: false,
        error: 'Skin not found.',
      });
    }

    res.json({
      success: true,
      data: skin,
    });
  } catch (err) {
    console.error('Error fetching skin:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skin.',
      message: err.message,
    });
  }
};

/**
 * Get multiple skins by their IDs (batch fetch).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSkinsByIds = async (req, res) => {
  try {
    const { ids } = req.query; // e.g., ?ids=1,2,3,4,5
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: ids',
      });
    }

    // Parse comma-separated IDs and convert to numbers
    const skinIds = ids.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
    
    if (skinIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid skin IDs provided',
      });
    }

    // Fetch all skins matching the provided IDs
    const skins = await Skin.find({ skinId: { $in: skinIds } }).lean();

    res.json({
      success: true,
      count: skins.length,
      data: skins,
    });
  } catch (err) {
    console.error('Error fetching skins by IDs:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skins.',
      message: err.message,
    });
  }
};

/**
 * Get AI-generated summary for a specific skin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSkinSummary = async (req, res) => {
  try {
    const { skinId } = req.params;
    
    // Validate skinId
    const numericSkinId = Number(skinId);
    if (isNaN(numericSkinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skin ID. Must be a valid number.',
      });
    }

    // Get skin with summary data
    const skin = await Skin.findOne({ skinId: numericSkinId })
      .select('skinId name skinSummary summaryGeneratedAt totalNumberOfComments');

    if (!skin) {
      return res.status(404).json({
        success: false,
        error: 'Skin not found.',
      });
    }

    // Check if summary exists
    if (!skin.skinSummary || skin.skinSummary.trim() === '') {
      return res.json({
        success: true,
        data: {
          skinId: skin.skinId,
          name: skin.name,
          hasSummary: false,
          summary: null,
          generatedAt: null,
          commentCount: skin.totalNumberOfComments,
          message: 'No summary available yet. Summary will be generated when enough comments are collected.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        skinId: skin.skinId,
        name: skin.name,
        hasSummary: true,
        summary: skin.skinSummary,
        generatedAt: skin.summaryGeneratedAt,
        totalComments: skin.totalNumberOfComments
      }
    });

  } catch (err) {
    console.error('Error fetching skin summary:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skin summary.',
      message: err.message,
    });
  }
};

/**
 * Trigger manual skin synchronization from CommunityDragon.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.syncSkins = async (req, res) => {
  try {
    const { championId } = req.body; // Optional: sync single champion
    
    if (skinManager.isSyncInProgress()) {
      return res.status(409).json({
        success: false,
        error: 'Skin synchronization is already running.',
      });
    }

    // Call the manager
    const progress = await skinManager.syncSkins(championId);
    
    res.json({
      success: true,
      message: 'Skin synchronization completed.',
      data: progress
    });
  } catch (err) {
    console.error('Error syncing skins:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to sync skins.',
      message: err.message,
    });
  }
};

/**
 * Get current progress of skin synchronization.
 * @param {Object} req
 * @param {Object} res
 */
exports.getSyncStatus = async (req, res) => {
  try {
    const progress = skinManager.getProgress();
    res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    console.error('Error fetching sync status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync status.',
      message: err.message,
    });
  }
};
