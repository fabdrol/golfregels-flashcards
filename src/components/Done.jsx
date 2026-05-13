export default function Done({ stats, onPracticeAgain, onHome, hasPractice }) {
  return (
    <div className="done">
      <h2 className="done__title">Goed gedaan!</h2>
      <div className="done__stats">
        <div className="done__stat">
          <span className="done__stat-num">{stats.learned}</span>
          <span className="done__stat-label">geleerd</span>
        </div>
        <div className="done__stat">
          <span className="done__stat-num">{stats.practice}</span>
          <span className="done__stat-label">nog oefenen</span>
        </div>
      </div>

      <button
        className="btn btn--primary"
        onClick={onPracticeAgain}
        disabled={!hasPractice}
      >
        Oefen herhalingen
      </button>
      <button className="btn btn--secondary" onClick={onHome}>
        Terug naar home
      </button>
    </div>
  );
}
