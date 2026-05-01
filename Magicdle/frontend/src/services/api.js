import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Returns { image_url, released_at }
export const fetchDailyChallenge = async () => {
  const response = await api.get('/daily');
  return response.data;
};

// Returns [{ id, name, set_name, image_url }, ...]
export const searchCards = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const response = await api.get('/search', { params: { q: query } });
  return response.data;
};

// Returns { correct: bool, hint: 'OLDER'|'NEWER'|null, card_name?: string }
export const submitGuess = async (guessedName, guessedReleasedAt) => {
  const response = await api.post('/guess', { guessedName, guessedReleasedAt });
  return response.data;
};

// Returns { level, zones: [{ id, label, x, y, w, h }, ...], data: { artist, mana_cost?, ... } }
export const fetchHint = async (level) => {
  const response = await api.get('/hint', { params: { level } });
  return response.data;
};