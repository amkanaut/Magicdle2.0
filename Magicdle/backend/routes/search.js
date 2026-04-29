const express = require('express');
const router = express.Router();
const scryfallService = require('../services/scryfallService');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const results = await scryfallService.searchCards(q);
    res.json(results);
  } catch (error) {
    console.error('Error in /api/search:', error.message);
    res.status(500).json({ error: 'Failed to search cards' });
  }
});

module.exports = router;
