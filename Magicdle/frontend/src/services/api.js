import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchDailyChallenge = async () => {
  // GET /api/daily
};

const searchCards = async (query) => {
  // GET /api/search?q=
};

export default {
  fetchDailyChallenge,
  searchCards
};

/**
 * API Service
 * Responsibility: Centralized location for all network requests to the Magicdle backend.
 */
