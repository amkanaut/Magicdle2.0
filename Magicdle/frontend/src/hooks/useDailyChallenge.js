import { useState, useEffect } from 'react';
import {
  fetchDailyChallenge,
  fetchArchiveChallenge,
  submitGuess,
  fetchHint,
} from '../services/api';

const MAX_HINT_LEVEL = 11;

const getTodayKey = () => new Date().toISOString().split('T')[0];

// date = null → today's daily game
// date = 'YYYY-MM-DD' → archive game for that date
const useChallenge = (date = null) => {
  const isArchive   = date !== null;
  const targetDate  = date || getTodayKey();
  const STORAGE_KEY = `magicdle_${targetDate}`;

  const loadStored = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const [challenge, setChallenge]       = useState(null);
  const [guesses, setGuesses]           = useState([]);
  const [status, setStatus]             = useState('playing');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [hintLevel, setHintLevel]       = useState(0);
  const [hints, setHints]               = useState(null);
  const [hintLoading, setHintLoading]   = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const stored = loadStored();
        const data   = isArchive
          ? await fetchArchiveChallenge(targetDate)
          : await fetchDailyChallenge();
        setChallenge(data);

        // Discard stored state if it belongs to a different card (e.g. DB was
        // reset for testing). released_at is safe to compare — it's not secret.
        const stateIsValid = stored && stored.released_at === String(data.released_at);
        if (stateIsValid) {
          setGuesses(stored.guesses ?? []);
          setStatus(stored.status  ?? 'playing');
          if (stored.hintLevel > 0) {
            setHintLevel(stored.hintLevel);
            const hintData = await fetchHint(stored.hintLevel, isArchive ? targetDate : null);
            setHints(hintData);
          }
        }
      } catch (err) {
        setError('Failed to load this challenge.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  useEffect(() => {
    if (guesses.length === 0 && status === 'playing' && hintLevel === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      released_at: challenge?.released_at,  // fingerprint for this specific card
      guesses,
      status,
      hintLevel,
    }));
  }, [guesses, status, hintLevel, STORAGE_KEY, challenge]);

  const makeGuess = async (guessedName) => {
    if (status !== 'playing') return;
    try {
      const result = await submitGuess(guessedName, isArchive ? targetDate : null);
      setGuesses(prev => [...prev, {
        name:    guessedName,
        hint:    result.hint,
        correct: result.correct,
      }]);
      if (result.correct) setStatus('won');
    } catch (err) {
      console.error('Failed to submit guess:', err);
    }
  };

  const requestHint = async () => {
    if (status !== 'playing' || hintLevel >= MAX_HINT_LEVEL) return;
    const nextLevel = hintLevel + 1;
    setHintLoading(true);
    try {
      const hintData = await fetchHint(nextLevel, isArchive ? targetDate : null);
      setHintLevel(nextLevel);
      setHints(hintData);
    } catch (err) {
      console.error('Failed to fetch hint:', err);
    } finally {
      setHintLoading(false);
    }
  };

  return {
    challenge,
    guesses,
    status,
    loading,
    error,
    makeGuess,
    hintLevel,
    hints,
    hintLoading,
    requestHint,
    hintsExhausted: hintLevel >= MAX_HINT_LEVEL,
    isArchive,
    targetDate,
  };
};

export default useChallenge;
