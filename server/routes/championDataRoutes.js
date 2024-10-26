// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const axios = require("axios");

router.get(
  '/champion_names', async (req, res) => {
    try {
      const response = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.18.1/data/en_US/champion.json');
      res.json(response.data);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Failed to fetch champion datda' });
    }}
);


module.exports = router;