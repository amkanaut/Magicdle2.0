const express = require('express');
const router  = express.Router();
const scryfallService = require('../services/scryfallService');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ error: 'Query must be at least 1 character' });
    }

    const results = await scryfallService.autocompleteCards(q.trim());
    res.json(results); // [{ name }, ...]
  } catch (error) {
    console.error('Error in /api/search:', error.message);
    res.status(500).json({ error: 'Failed to search cards' });
  }
});

module.exports = router;
