import { topics } from '../data/flashcards.js';

export default function Card({ card, flipped, onFlip }) {
  const topic = topics[card.topic];

  return (
    <button
      type="button"
      className={`card ${flipped ? 'card--flipped' : ''}`}
      onClick={onFlip}
      aria-pressed={flipped}
    >
      <span className="card__topic" style={{ background: topic.color }}>
        {topic.label}
      </span>
      <div className="card__content">
        {flipped ? (
          <p className="card__back">{card.back}</p>
        ) : (
          <p className="card__front">{card.front}</p>
        )}
      </div>
      <span className="card__hint">
        {flipped ? '' : 'Klik of druk op spatie voor antwoord'}
      </span>
    </button>
  );
}
