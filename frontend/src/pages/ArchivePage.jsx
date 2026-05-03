import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArchiveList } from '../services/api';

const ArchivePage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    fetchArchiveList()
      .then(setChallenges)
      .catch(() => setError('Failed to load archive.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="archive-page">
      <header className="archive-page__header">
        <h1 className="game-board__title">Magicdle</h1>
        <p className="game-board__subtitle">Past challenges</p>
        <Link to="/" className="nav-link">← Today's card</Link>
      </header>

      {loading && (
        <div className="archive-page__loading">
          <div className="spinner" />
          <p>Loading archive…</p>
        </div>
      )}

      {error && <p className="game-board__status game-board__status--error">{error}</p>}

      {!loading && !error && challenges.length === 0 && (
        <p className="game-board__status">No past challenges yet — check back tomorrow!</p>
      )}

      {!loading && !error && challenges.length > 0 && (
        <div className="archive-grid">
          {challenges.map(c => (
            <Link key={c.date} to={`/archive/${c.date}`} className="archive-card">
              <div className="archive-card__img-wrap">
                <img
                  src={c.image_url}
                  alt={c.card_name}
                  className="archive-card__img"
                />
              </div>
              <div className="archive-card__label">
                <span className="archive-card__date">{formatDate(c.date)}</span>
                <span className="archive-card__name">{c.card_name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

export default ArchivePage;
