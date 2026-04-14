const axios = require('axios');

const SCRYFALL_BASE_URL = process.env.SCRYFALL_BASE_URL || 'https://api.scryfall.com';

const getRandomCard = async () => {
  // Logic to fetch a random card from Scryfall API
};

const searchCards = async (query) => {
  // Logic to proxy search requests to Scryfall
};

module.exports = {
  getRandomCard,
  searchCards
};

/**
 * Scryfall Service
 * Responsibility: Handles all outgoing requests to the external Scryfall API.
 */
