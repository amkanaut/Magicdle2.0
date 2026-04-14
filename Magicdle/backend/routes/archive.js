const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Archive endpoint" });
});

router.get('/:date', (req, res) => {
  res.json({ message: `Archive for date: ${req.params.date}` });
});

module.exports = router;

/**
 * Archive Route
 * Responsibility: Provides a list of past challenges and allows retrieval of specific past days.
 */
