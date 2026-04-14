const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Search endpoint" });
});

module.exports = router;

/**
 * Search Route
 * Responsibility: Proxies Scryfall card name search for autocomplete.
 */
