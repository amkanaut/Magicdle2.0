import { useState, useEffect } from 'react';
import { fetchDailyChallenge, submitGuess, fetchHint } from '../services/api';

const MAX_HINT_LEVEL = 6; // matches the number of hint levels defined in /api/hint
const STORAGE_KEY = 'magicdle_state';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
};

const useDailyChallenge = () => {
  const [challenge, setChallenge] = useState(null);   // { image_url, released_at }
  const [guesses, setGuesses]     = useState([]);     // [{ name, hint, correct }, ...]
  const [status, setStatus]       = useState('playing'); // 'playing' | 'won'
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Hint state — fully independent of guess count
  const [hintLevel, setHintLevel]   = useState(0);
  const [hints, setHints]           = useState(null);  // last /api/hint response
  const [hintLoading, setHintLoading] = useState(false);

  // On mount: fetch today's card and restore any saved session
  useEffect(() => {
    const init = async () => {
      try {
        const stored = loadStoredState();
        const data = await fetchDailyChallenge();
        setChallenge(data);

        if (stored) {
          setGuesses(stored.guesses);
          setStatus(stored.status);

          // Restore hint level and re-fetch hint data so zones are available
          if (stored.hintLevel > 0) {
            setHintLevel(stored.hintLevel);
            const hintData = await fetchHint(stored.hintLevel);
            setHints(hintData);
          }
        }
      } catch (err) {
        setError('Failed to load today\'s challenge.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Persist guesses, status, and hintLevel to localStorage on every change
  useEffect(() => {
    if (guesses.length === 0 && status === 'playing' && hintLevel === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: getTodayKey(),
      guesses,
      status,
      hintLevel,
    }));
  }, [guesses, status, hintLevel]);

  // Submit a guess — no limit on attempts
  const makeGuess = async (guessedName, guessedReleasedAt) => {
    if (status !== 'playing') return;

    try {
      const result = await submitGuess(guessedName, guessedReleasedAt);

      setGuesses(prev => [...prev, {
        name:    guessedName,
        hint:    result.hint,    // 'OLDER' | 'NEWER' | null
        correct: result.correct,
      }]);

      if (result.correct) {
        setStatus('won');
      }
    } catch (err) {
      console.error('Failed to submit guess:', err);
    }
  };

  // Request the next hint level — user-initiated, independent of guesses
  const requestHint = async () => {
    if (status !== 'playing') return;
    if (hintLevel >= MAX_HINT_LEVEL) return;

    const nextLevel = hintLevel + 1;
    setHintLoading(true);
    try {
      const hintData = await fetchHint(nextLevel);
      setHintLevel(nextLevel);
      setHints(hintData);
    } catch (err) {
      console.error('Failed to fetch hint:', err);
    } finally {
      setHintLoading(false);
    }
  };

  return {
    challenge,     // { image_url, released_at } — pass to ImageReveal
    guesses,       // [{ name, hint, correct }] — pass to FeedbackRow
    status,        // 'playing' | 'won'
    loading,
    error,
    makeGuess,
    hintLevel,     // 0–6, current hint depth
    hints,         // { level, zones, data } from /api/hint — pass to ImageReveal + HintPanel
    hintLoading,   // true while fetching next hint
    requestHint,   // call this when the player clicks the hint button
    hintsExhausted: hintLevel >= MAX_HINT_LEVEL,
  };
};

export default useDailyChallenge;
