import { topics, flashcards } from '../data/flashcards.js';

export default function Home({
  selectedTopics,
  onToggleTopic,
  onStart,
  progress,
  onReset,
  storageAvailable,
}) {
  const topicIds = Object.keys(topics);

  const stats = topicIds.reduce((acc, id) => {
    const cards = flashcards.filter((c) => c.topic === id);
    const known = cards.filter((c) => progress[c.id] === 'known').length;
    const practice = cards.filter((c) => progress[c.id] === 'practice').length;
    acc[id] = { total: cards.length, known, practice };
    return acc;
  }, {});

  const selectedCount = flashcards.filter((c) =>
    selectedTopics.has(c.topic)
  ).length;

  const handleReset = () => {
    if (window.confirm('Weet je zeker dat je alle voortgang wilt wissen?')) {
      onReset();
    }
  };

  return (
    <div className="home">
      <h1>GVB Oefenen</h1>
      <p className="home__intro">
        Kies één of meer onderwerpen en start een oefensessie.
      </p>

      <div className="home__topics">
        {topicIds.map((id) => {
          const t = topics[id];
          const s = stats[id];
          const checked = selectedTopics.has(id);
          return (
            <label
              key={id}
              className={`topic ${checked ? 'topic--checked' : ''}`}
              style={{ borderColor: checked ? t.color : 'transparent' }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleTopic(id)}
              />
              <span className="topic__dot" style={{ background: t.color }} />
              <span className="topic__label">{t.label}</span>
              <span className="topic__counts">
                {s.known}/{s.total} geleerd · {s.practice} nog oefenen
              </span>
            </label>
          );
        })}
      </div>

      <button
        className="btn btn--primary"
        onClick={onStart}
        disabled={selectedCount === 0}
      >
        Start oefenen ({selectedCount} kaarten)
      </button>

      <button className="btn btn--secondary" onClick={handleReset}>
        Reset voortgang
      </button>

      {!storageAvailable && (
        <p className="home__warning">
          Voortgang wordt niet bewaard (browser-instelling blokkeert opslag).
        </p>
      )}
    </div>
  );
}
