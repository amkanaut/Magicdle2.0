import React from 'react';

// NEWER = your guess released BEFORE the answer → answer is newer → ↑
// OLDER = your guess released AFTER the answer  → answer is older → ↓
const BADGE = {
  NEWER:   { label: '↑ Newer',  mod: 'newer'   },
  OLDER:   { label: '↓ Older',  mod: 'older'   },
  correct: { label: '✓ Correct', mod: 'correct' },
};

const FeedbackRow = ({ guesses }) => {
  if (!guesses.length) return null;

  return (
    <div className="feedback-list">
      {guesses.map((guess, i) => {
        const badge = guess.correct ? BADGE.correct : BADGE[guess.hint];
        return (
          <div
            key={i}
            className={`feedback-row${guess.correct ? ' feedback-row--correct' : ''}`}
          >
            <span className="feedback-row__name">{guess.name}</span>
            {badge && (
              <span className={`feedback-row__badge feedback-row__badge--${badge.mod}`}>
                {badge.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackRow;
