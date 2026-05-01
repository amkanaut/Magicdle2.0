const express = require('express');
const router  = express.Router();
const scryfallService = require('../services/scryfallService');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const results = await scryfallService.searchCards(q.trim());
    res.json(results); // Already trimmed to { id, name, set_name, image_url } in the service
  } catch (error) {
    console.error('Error in /api/search:', error.message);
    res.status(500).json({ error: 'Failed to search cards' });
  }
});

module.exports = router;