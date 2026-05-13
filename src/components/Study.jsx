import { useEffect, useState } from 'react';
import Card from './Card.jsx';

export default function Study({ pool, cards, onMark, onExit, onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [extendedPool, setExtendedPool] = useState(pool);
  const [rescheduled, setRescheduled] = useState(() => new Set());
  const [stats, setStats] = useState({ learned: 0, practice: 0 });

  const currentCard = cards.find((c) => c.id === extendedPool[index]);

  const advance = (newPool = extendedPool, newIndex = index + 1) => {
    if (newIndex >= newPool.length) {
      onComplete(stats);
      return;
    }
    setExtendedPool(newPool);
    setIndex(newIndex);
    setFlipped(false);
  };

  const handleMark = (status) => {
    if (!currentCard) return;
    onMark(currentCard.id, status);
    let newPool = extendedPool;
    if (status === 'practice' && !rescheduled.has(currentCard.id)) {
      newPool = [...extendedPool, currentCard.id];
      setRescheduled((s) => new Set(s).add(currentCard.id));
    }
    setStats((s) => ({
      learned: s.learned + (status === 'known' ? 1 : 0),
      practice: s.practice + (status === 'practice' ? 1 : 0),
    }));
    advance(newPool);
  };

  const handleSkip = () => advance();
  const handleFlip = () => setFlipped((f) => !f);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onExit();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        return setFlipped((f) => !f);
      }
      if (!flipped) return;
      if (e.key === '1') return handleMark('known');
      if (e.key === '2') return handleMark('practice');
      if (e.key === 'ArrowRight') return handleSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!currentCard) {
    return null;
  }

  const total = extendedPool.length;
  const seen = index;

  return (
    <div className="study">
      <div className="study__header">
        <div className="study__progress">
          <div className="study__progress-bar">
            <div
              className="study__progress-fill"
              style={{ width: `${(seen / total) * 100}%` }}
            />
          </div>
          <span className="study__progress-text">
            {seen + 1} / {total} · {stats.learned} geleerd
          </span>
        </div>
        <button
          className="study__exit"
          onClick={onExit}
          aria-label="Sluit oefensessie"
        >
          ✕
        </button>
      </div>

      <Card card={currentCard} flipped={flipped} onFlip={handleFlip} />

      <div className="study__actions">
        {flipped ? (
          <>
            <button
              className="btn btn--known"
              onClick={() => handleMark('known')}
            >
              Ken ik (1)
            </button>
            <button
              className="btn btn--practice"
              onClick={() => handleMark('practice')}
            >
              Nog oefenen (2)
            </button>
            <button className="btn btn--skip" onClick={handleSkip}>
              Skip (→)
            </button>
          </>
        ) : (
          <p className="study__hint">
            Klik op de kaart of druk op spatie voor het antwoord.
          </p>
        )}
      </div>
    </div>
  );
}
