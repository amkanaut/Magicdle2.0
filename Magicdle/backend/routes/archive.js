const express = require('express');
const router = express.Router();
const DailyChallenge = require('../models/DailyChallenge');

// GET /api/archive — all past challenges, newest first
// Exposes card_name here because these are completed days; the game is over for them.
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const challenges = await DailyChallenge.find({ date: { $lt: today } })
      .sort({ date: -1 })
      .select('date image_url card_name')
      .lean();
    res.json(challenges);
  } catch (err) {
    console.error('[/api/archive] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

// GET /api/archive/:date — challenge data for one past date
// Returns the same shape as /api/daily so the game hook works for both.
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
    }

    if (date >= today) {
      return res.status(403).json({ error: 'Only past challenges are accessible via archive' });
    }

    const challenge = await DailyChallenge.findOne({ date });
    if (!challenge) {
      return res.status(404).json({ error: 'No challenge found for this date' });
    }

    res.json({
      image_url:   challenge.image_url,
      released_at: challenge.released_at,
    });
  } catch (err) {
    console.error('[/api/archive/:date] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch archive challenge' });
  }
});

module.exports = router;
