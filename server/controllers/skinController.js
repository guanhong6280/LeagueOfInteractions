const Skin = require('../models/Skin');

/**
 * Get all skins, with optional filters.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllSkins = async (req, res) => {
  try {
    const { championId, skinLineId } = req.query;
    const filter = {};

    // Add filters if provided
    if (championId) {
      filter.championId = championId;
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
