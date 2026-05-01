const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  scryfall_id: { type: String, required: true },
  card_name: { type: String, required: true },
  image_url: { type: String, required: true },
  mana_cost: String,
  power: String,       // null for non-creature cards
  toughness: String,   // null for non-creature cards
  artist: String,
  rarity: String,
  set_name: String,
  set_code: String,
  card_type: String,
  oracle_text: String,
  released_at: Date
});

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
