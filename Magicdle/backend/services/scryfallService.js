const axios = require('axios');

const SCRYFALL_BASE_URL = process.env.SCRYFALL_BASE_URL || 'https://api.scryfall.com';

// In-memory cache for card lookups so repeated guesses of the same card
// name don't hit Scryfall twice. Clears on server restart, which is fine.
const cardNameCache = new Map();

const getRandomCard = async () => {
  try {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 5);
    const cutoffDate = cutoff.toISOString().slice(0, 10); // "YYYY-MM-DD"

    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/random`, {
      params: { q: `date>=${cutoffDate} lang:en -is:token -is:digital is:paper -t:basic` },
    });
    const card = response.data;

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
      released_at: card.released_at,
      artist:      card.artist      ?? card.card_faces?.[0]?.artist ?? '',
      power:       card.power       ?? null,
      toughness:   card.toughness   ?? null,
    };
  } catch (error) {
    console.error('Error fetching random card from Scryfall:', error.message);
    throw error;
  }
};

// Uses Scryfall's dedicated autocomplete endpoint — responds from the first
// character, returns up to 20 prefix-matched card names very quickly.
const autocompleteCards = async (query) => {
  try {
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/autocomplete`, {
      params: { q: query, include_extras: false },
    });
    // response.data.data is a plain string[] of card names
    return response.data.data.map(name => ({ name }));
  } catch (error) {
    if (error.response?.status === 404) return [];
    console.error('Error in autocomplete:', error.message);
    throw error;
  }
};

// Fetches a single card by its exact name — used by the guess route to get
// released_at without trusting the client to supply it.
const getCardByName = async (name) => {
  const cacheKey = name.toLowerCase();
  if (cardNameCache.has(cacheKey)) return cardNameCache.get(cacheKey);

  try {
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/named`, {
      params: { exact: name },
    });
    const card = response.data;
    const result = {
      name:        card.name,
      released_at: card.released_at,
    };
    cardNameCache.set(cacheKey, result);
    return result;
  } catch (error) {
    if (error.response?.status === 404) return null; // unknown card name
    console.error('Error fetching card by name:', error.message);
    throw error;
  }
};

module.exports = { getRandomCard, autocompleteCards, getCardByName };
