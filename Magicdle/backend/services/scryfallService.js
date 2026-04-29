const axios = require('axios');

const SCRYFALL_BASE_URL = process.env.SCRYFALL_BASE_URL || 'https://api.scryfall.com';

const getRandomCard = async () => {
  try {
    // We might want to filter for cards that are legal in modern or standard, 
    // or just generally 'clean' cards. For now, let's get any random card.
    // Scryfall random endpoint: https://api.scryfall.com/cards/random
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/random`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random card from Scryfall:', error.message);
    throw error;
  }
};

const searchCards = async (query) => {
  try {
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching cards on Scryfall:', error.message);
    // If 404, it just means no cards found
    if (error.response && error.response.status === 404) {
      return { data: [] };
    }
    throw error;
  }
};

module.exports = {
  getRandomCard,
  searchCards
};
