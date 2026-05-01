const axios = require('axios');

const SCRYFALL_BASE_URL = process.env.SCRYFALL_BASE_URL || 'https://api.scryfall.com';

const getRandomCard = async () => {
  try {
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/random`);
    const card = response.data;

    // Transform raw Scryfall data into only what Magicdle needs.
    // Double-faced cards (card_faces) don't have top-level image_uris,
    // so we fall back to the first face.
    return {
      id:          card.id,
      name:        card.name,
      mana_cost:   card.mana_cost   ?? card.card_faces?.[0]?.mana_cost ?? '',
      type_line:   card.type_line,
      oracle_text: card.oracle_text ?? card.card_faces?.[0]?.oracle_text ?? '',
      image_url:   card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? '',
      set_name:    card.set_name,
      set_code:    card.set,
      rarity:      card.rarity,
      released_at: card.released_at, // "YYYY-MM-DD" string from Scryfall
      artist:      card.artist      ?? card.card_faces?.[0]?.artist ?? '',
      power:       card.power       ?? null, // only present on creature cards
      toughness:   card.toughness   ?? null,
    };
  } catch (error) {
    console.error('Error fetching random card from Scryfall:', error.message);
    throw error;
  }
};

const searchCards = async (query) => {
  try {
    // `unique=cards` so duplicates of same card removed if they have multiple versions/reprints
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/search`, {
      params: {
        q:      `!"${query}"`, // exact name match prefix, gives best autocomplete results
        unique: 'cards',
        order:  'name',
      },
    });

    // Only return what the autocomplete dropdown needs
// In scryfallService.js searchCards map:
  return response.data.data.map(card => ({
    id:           card.id,
    name:         card.name,
    set_name:     card.set_name,
    released_at:  card.released_at, // needed for guess comparison
    image_url:    card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small ?? '',
  }));
  } catch (error) {
    if (error.response?.status === 404) {
      return []; // No cards matched — not a server error, just an empty result
    }
    console.error('Error searching cards on Scryfall:', error.message);
    throw error;
  }
};

module.exports = { getRandomCard, searchCards };