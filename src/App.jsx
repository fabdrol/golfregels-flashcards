import { useState } from 'react';
import { flashcards, topics } from './data/flashcards.js';
import { jargonCards, jargonTopics } from './data/jargon.js';
import { useProgress } from './hooks/useProgress.js';
import Home from './components/Home.jsx';
import Study from './components/Study.jsx';
import Done from './components/Done.jsx';

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const MODES = {
  gvb: {
    label: 'GVB-vragen',
    cards: flashcards,
    topics: topics,
    storageKey: 'golfregels.progress.v1',
  },
  jargon: {
    label: 'Jargon',
    cards: jargonCards,
    topics: jargonTopics,
    storageKey: 'golfregels.jargon.v1',
  },
};

export default function App() {
  const [view, setView] = useState('home');
  const [mode, setMode] = useState('gvb');
  const [selectedTopics, setSelectedTopics] = useState(() => ({
    gvb: new Set(Object.keys(topics)),
    jargon: new Set(Object.keys(jargonTopics)),
  }));
  const [pool, setPool] = useState([]);
  const [doneStats, setDoneStats] = useState({ learned: 0, practice: 0 });

  const gvbProgress = useProgress(MODES.gvb.storageKey);
  const jargonProgress = useProgress(MODES.jargon.storageKey);
  const progressByMode = { gvb: gvbProgress, jargon: jargonProgress };

  const activeMode = MODES[mode];
  const activeProgress = progressByMode[mode];
  const activeSelected = selectedTopics[mode];

  const toggleTopic = (id) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev[mode]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [mode]: next };
    });
  };

  const startSession = () => {
    const ids = activeMode.cards
      .filter((c) => activeSelected.has(c.topic))
      .map((c) => c.id);
    if (ids.length === 0) return;
    setPool(shuffle(ids));
    setView('study');
  };

  const startPracticeAgain = () => {
    const practiceIds = Object.keys(activeProgress.progress).filter(
      (id) => activeProgress.progress[id] === 'practice'
    );
    if (practiceIds.length === 0) return;
    setPool(shuffle(practiceIds));
    setView('study');
  };

  const completeSession = (stats) => {
    setDoneStats(stats);
    setView('done');
  };

  const goHome = () => setView('home');

  const hasPractice = Object.values(activeProgress.progress).some(
    (s) => s === 'practice'
  );

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          mode={mode}
          onModeChange={setMode}
          modes={MODES}
          topics={activeMode.topics}
          cards={activeMode.cards}
          selectedTopics={activeSelected}
          onToggleTopic={toggleTopic}
          onStart={startSession}
          progress={activeProgress.progress}
          onReset={activeProgress.reset}
          storageAvailable={activeProgress.storageAvailable}
        />
      )}
      {view === 'study' && (
        <Study
          pool={pool}
          cards={activeMode.cards}
          onMark={activeProgress.mark}
          onExit={goHome}
          onComplete={completeSession}
        />
      )}
      {view === 'done' && (
        <Done
          stats={doneStats}
          onPracticeAgain={startPracticeAgain}
          onHome={goHome}
          hasPractice={hasPractice}
        />
      )}
    </div>
  );
}
