import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Returns { image_url, released_at }
export const fetchDailyChallenge = async () => {
  const response = await api.get('/daily');
  return response.data;
};

// Returns { image_url, released_at } for a past date
export const fetchArchiveChallenge = async (date) => {
  const response = await api.get(`/archive/${date}`);
  return response.data;
};

// Returns [{ date, image_url, card_name }, ...] newest first
export const fetchArchiveList = async () => {
  const response = await api.get('/archive');
  return response.data;
};

// Returns [{ name }, ...] — release date is looked up server-side on guess
export const searchCards = async (query) => {
  if (!query || query.trim().length < 1) return [];
  const response = await api.get('/search', { params: { q: query } });
  return response.data;
};

// Returns { correct: bool, hint: 'OLDER'|'NEWER'|null, card_name?: string }
// Pass date for archive games so the backend checks the right card.
export const submitGuess = async (guessedName, date = null) => {
  const body = { guessedName };
  if (date) body.date = date;
  const response = await api.post('/guess', body);
  return response.data;
};

// Returns { level, zones, data }
// Pass date for archive games so hints reference the right card.
export const fetchHint = async (level, date = null) => {
  const params = { level };
  if (date) params.date = date;
  const response = await api.get('/hint', { params });
  return response.data;
};
