import React from 'react';
import { Link } from 'react-router-dom';
import useChallenge from '../../hooks/useDailyChallenge';
import ImageReveal from '../ImageReveal';
import HintPanel from '../HintPanel';
import GuessInput from '../GuessInput';
import FeedbackRow from '../FeedbackRow';

// date = null → today's daily game
// date = 'YYYY-MM-DD' → archive game (passed from ArchiveGame page)
const GameBoard = ({ date = null }) => {
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
    isArchive,
    targetDate,
  } = useChallenge(date);

  if (loading) {
    return (
      <div className="game-board">
        <div className="game-board__loading">
          <div className="spinner" />
          <p>Loading challenge…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-board">
        <p className="game-board__status game-board__status--error">{error}</p>
        <Link to="/" className="nav-link">← Back to today</Link>
      </div>
    );
  }

  const wonGuess = guesses.find(g => g.correct);

  return (
    <div className="game-board">
      <header className="game-board__header">
        <h1 className="game-board__title">Magicdle</h1>
        <p className="game-board__subtitle">
          {isArchive
            ? `Archive — ${formatDate(targetDate)}`
            : 'Guess the Magic: The Gathering card'}
        </p>
        <nav className="game-board__nav">
          {isArchive
            ? <Link to="/" className="nav-link">← Today's card</Link>
            : <Link to="/archive" className="nav-link">Archive</Link>}
        </nav>
      </header>

      <ImageReveal
        imageUrl={challenge?.image_url}
        zones={hints?.zones}
        revealed={status === 'won'}
      />

      {status === 'won' ? (
        <div className="win-screen">
          <p className="win-screen__card-name">{wonGuess?.name}</p>
          <div className="win-screen__stats">
            <div className="win-screen__stat">
              <span className="win-screen__stat-value">{guesses.length}</span>
              <span className="win-screen__stat-label">{guesses.length === 1 ? 'Guess' : 'Guesses'}</span>
            </div>
            <div className="win-screen__stat">
              <span className="win-screen__stat-value">{hintLevel}</span>
              <span className="win-screen__stat-label">{hintLevel === 1 ? 'Hint' : 'Hints'}</span>
            </div>
          </div>
          {!isArchive && (
            <Link to="/archive" className="nav-link nav-link--subtle">Browse past cards →</Link>
          )}
        </div>
      ) : (
        <>
          <HintPanel
            hintLevel={hintLevel}
            hintLoading={hintLoading}
            hintsExhausted={hintsExhausted}
            requestHint={requestHint}
            status={status}
          />
          <GuessInput onGuess={makeGuess} />
        </>
      )}

      <FeedbackRow guesses={guesses} />
    </div>
  );
};

const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};

export default GameBoard;
