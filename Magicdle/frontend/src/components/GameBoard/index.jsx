import React from 'react';
import useDailyChallenge from '../../hooks/useDailyChallenge';
import ImageReveal from '../ImageReveal';
import HintPanel from '../HintPanel';
import GuessInput from '../GuessInput';
import FeedbackRow from '../FeedbackRow';

const GameBoard = () => {
  const {
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
    hintsExhausted,
  } = useDailyChallenge();

  if (loading) {
    return (
      <div className="game-board">
        <p className="game-board__status">Loading today's challenge…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-board">
        <p className="game-board__status game-board__status--error">{error}</p>
      </div>
    );
  }

  return (
    <div className="game-board">
      <header className="game-board__header">
        <h1 className="game-board__title">Magicdle</h1>
        <p className="game-board__subtitle">Guess the Magic: The Gathering card</p>
      </header>

      {status === 'won' && (
        <div className="game-board__win-banner">
          Got it in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!
        </div>
      )}

      <ImageReveal
        imageUrl={challenge?.image_url}
        zones={hints?.zones}
      />

      <HintPanel
        hintLevel={hintLevel}
        hintLoading={hintLoading}
        hintsExhausted={hintsExhausted}
        requestHint={requestHint}
        status={status}
      />

      {status === 'playing' && (
        <GuessInput onGuess={makeGuess} />
      )}

      <FeedbackRow guesses={guesses} />
    </div>
  );
};

export default GameBoard;
