const express = require('express');
const router  = express.Router();
const DailyChallenge  = require('../models/DailyChallenge');
const scryfallService = require('../services/scryfallService');

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD" UTC

    let dailyCard = await DailyChallenge.findOne({ date: today });

    if (!dailyCard) {
      console.log(`No daily card for ${today}. Fetching from Scryfall...`);
      const card = await scryfallService.getRandomCard();

      dailyCard = await DailyChallenge.create({
        date:        today,
        scryfall_id: card.id,
        card_name:   card.name,
        image_url:   card.image_url,
        mana_cost:   card.mana_cost,
        power:       card.power,
        toughness:   card.toughness,
        artist:      card.artist,
        rarity:      card.rarity,
        set_name:    card.set_name,
        set_code:    card.set_code,
        card_type:   card.type_line,
        oracle_text: card.oracle_text,
        released_at: card.released_at,
      });

      console.log(`Saved new daily card: ${dailyCard.card_name}`);
    }

    // Never expose oracle_text or the full card document to the client on initial load.
    // The frontend only needs enough to render the blurred image and accept guesses.
    // Hints are served separately by /api/hint.
    res.json({
      image_url:   dailyCard.image_url,
      released_at: dailyCard.released_at,
      // send released_at so the frontend can do OLDER/NEWER comparison
      // after the backend validates the guess. See /api/guess.
    });
  } catch (error) {
    console.error('Error in /api/daily:', error.message);
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
});

module.exports = router;