import { useState, useEffect, useRef } from 'react';
import { searchCards } from '../../services/api';

const DEBOUNCE_MS = 300;

const GuessInput = ({ onGuess, disabled }) => {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [isOpen, setIsOpen]         = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  // Search whenever query changes, debounced
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const cards = await searchCards(query);
      setResults(cards);
      setIsOpen(cards.length > 0);
      setActiveIndex(-1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (card) => {
    onGuess(card.name, card.released_at);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault();
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="guess-input">
      <input
        ref={inputRef}
        type="text"
        className="guess-input__field"
        placeholder="Type a card name…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />

      {isOpen && (
        <ul className="guess-input__dropdown" role="listbox">
          {results.map((card, i) => (
            <li
              key={card.id}
              role="option"
              aria-selected={i === activeIndex}
              className={`guess-input__option${i === activeIndex ? ' guess-input__option--active' : ''}`}
              onMouseDown={() => handleSelect(card)}
            >
              <span className="guess-input__name">{card.name}</span>
              <span className="guess-input__set">{card.set_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuessInput;
