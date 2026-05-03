const express = require('express');
const router  = express.Router();
const DailyChallenge  = require('../models/DailyChallenge');
const scryfallService = require('../services/scryfallService');

router.post('/', async (req, res) => {
  try {
    const { guessedName, date } = req.body;

    if (!guessedName) {
      return res.status(400).json({ error: 'guessedName is required' });
    }

    // Optional date lets archive games validate against the right card.
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dailyCard = await DailyChallenge.findOne({ date: targetDate });

    if (!dailyCard) {
      return res.status(404).json({ error: 'No daily challenge found for today' });
    }

    const isCorrect = guessedName.toLowerCase() === dailyCard.card_name.toLowerCase();

    let hint = null;
    if (!isCorrect) {
      // Look up the guessed card's release date from Scryfall.
      // The client is not trusted to supply this — they could manipulate it.
      const guessedCard = await scryfallService.getCardByName(guessedName);

      if (!guessedCard) {
        return res.status(404).json({ error: `Card "${guessedName}" not found` });
      }

      const guessedDate = new Date(guessedCard.released_at);
      const correctDate = new Date(dailyCard.released_at);

      // Guessed card older than answer → tell player to go NEWER
      hint = guessedDate < correctDate ? 'NEWER' : 'OLDER';
    }

    res.json({
      correct: isCorrect,
      hint,
      ...(isCorrect && { card_name: dailyCard.card_name }),
    });
  } catch (error) {
    console.error('Error in /api/guess:', error.message);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

module.exports = router;
