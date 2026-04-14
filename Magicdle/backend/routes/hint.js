const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Hint endpoint" });
});

module.exports = router;

/**
 * Hint Route
 * Responsibility: Returns progressive hints based on the current level.
 */
