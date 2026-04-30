const express = require('express');
const router = express.Router();
const DailyChallenge = require('../models/DailyChallenge');
const scryfallService = require('../services/scryfallService');

router.get('/', async (req, res) => {
  try {
    const today = Temporal.Now.plainDateISO();

    // Check if we already have a challenge for today
    let dailyCard = await DailyChallenge.findOne({ date: today });

    if (!dailyCard) { // If there already isn't a daily card cached, then call Scryfall API
      console.log(`No daily card found for ${today}. Fetching from Scryfall...`);
      const scryfallCard = await scryfallService.getRandomCard();

      // Map Scryfall data to our DailyChallenge model
      dailyCard = new DailyChallenge({
        date: today,
        scryfall_id: scryfallCard.id,
        card_name: scryfallCard.name,
        image_url: scryfallCard.image_uris ? scryfallCard.image_uris.normal : (scryfallCard.card_faces ? scryfallCard.card_faces[0].image_uris.normal : ''),
        mana_cost: scryfallCard.mana_cost || (scryfallCard.card_faces ? scryfallCard.card_faces[0].mana_cost : ''),
        rarity: scryfallCard.rarity,
        set_name: scryfallCard.set_name,
        set_code: scryfallCard.set,
        card_type: scryfallCard.type_line,
        oracle_text: scryfallCard.oracle_text,
        released_at: scryfallCard.released_at
      });

      await dailyCard.save(); // Caching?
      console.log(`Saved new daily card: ${dailyCard.card_name}`);
    }

    res.json(dailyCard);
  } catch (error) {
    console.error('Error in /api/daily:', error.message);
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
});

module.exports = router;
