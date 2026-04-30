const axios = require('axios');

const SCRYFALL_BASE_URL = process.env.SCRYFALL_BASE_URL || 'https://api.scryfall.com';

const getRandomCard = async () => {
  try {
    // We might want to filter for cards that are legal in modern or standard, 
    // or just generally 'clean' cards. For now, let's get any random card.
    // Scryfall random endpoint: https://api.scryfall.com/cards/random
    const response = await axios.get(`${SCRYFALL_BASE_URL}/cards/random`);
    // const card = response.data;
    return response.data;

    // Filtering out fields that are necessary

    // return {
    //   name: card.name,
    //   mana_cost: card.mana_cost,
    //   type: card.type_line,
    //   oracle_text: card.oracle_text,
    //   image_url: card.image_uris?.normal,
    //   set_name: card.set_name,
    //   set_code: card.set_code,
    //   rarity: card.rarity,
    //   released_at: card.released_at
    // }
    
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


// getRandomCard().then(card => {
//   console.log("Here is your card data:");
//   console.log(card);
// });

module.exports = {
  getRandomCard,
  searchCards
};
