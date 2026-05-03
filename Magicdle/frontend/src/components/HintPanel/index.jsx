import React from 'react';

const HintPanel = ({ hintLevel, hintLoading, hintsExhausted, requestHint, status }) => {
  if (status !== 'playing') return null;

  const label = hintLoading
    ? 'Loading…'
    : hintsExhausted
      ? 'No more hints'
      : `Hint (${hintLevel} / 11)`;

  return (
    <button
      className="hint-button"
      onClick={requestHint}
      disabled={hintLoading || hintsExhausted}
    >
      {label}
    </button>
  );
};

export default HintPanel;
