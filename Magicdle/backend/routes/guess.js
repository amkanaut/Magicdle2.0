const express = require('express');
const router  = express.Router();
const DailyChallenge = require('../models/DailyChallenge');

router.post('/', async (req, res) => {
  try {
    const { guessedName, guessedReleasedAt } = req.body;
    // guessedReleasedAt comes from the autocomplete selection.
    // When a player picks a card from the dropdown, its releasedAt data will also be stored. 

    if (!guessedName || !guessedReleasedAt) {
      return res.status(400).json({ error: 'guessedName and guessedReleasedAt are required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyCard = await DailyChallenge.findOne({ date: today });

    if (!dailyCard) {
      return res.status(404).json({ error: 'No daily challenge found for today' });
    }

    const isCorrect = guessedName.toLowerCase() === dailyCard.card_name.toLowerCase();

    let hint = null;
    if (!isCorrect) {
      const guessedDate  = new Date(guessedReleasedAt);
      const correctDate  = new Date(dailyCard.released_at);

      // If the guessed card is older than the answer, tell the player to guess NEWER
      hint = guessedDate < correctDate ? 'NEWER' : 'OLDER';
    }

    res.json({
      correct: isCorrect,
      hint,
      // Only reveal the card name if the guess was correct
      ...(isCorrect && { card_name: dailyCard.card_name }),
    });
  } catch (error) {
    console.error('Error in /api/guess:', error.message);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

module.exports = router;