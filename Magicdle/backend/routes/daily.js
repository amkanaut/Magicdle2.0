const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Daily challenge endpoint" });
});

module.exports = router;

/**
 * Daily Route
 * Responsibility: Returns today's Magicdle card metadata.
 */
