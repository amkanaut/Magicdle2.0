import React from 'react';
import { useParams, Link } from 'react-router-dom';
import GameBoard from '../components/GameBoard';

const ArchiveGame = () => {
  const { date } = useParams();

  // Basic date format guard before hitting the API
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <div className="game-board">
        <p className="game-board__status game-board__status--error">
          Invalid date format — expected YYYY-MM-DD.
        </p>
        <Link to="/archive" className="nav-link">← Archive</Link>
      </div>
    );
  }

  return <GameBoard date={date} />;
};

export default ArchiveGame;
