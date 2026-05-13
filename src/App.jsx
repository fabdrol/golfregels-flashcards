import { useState } from 'react';
import { flashcards, topics } from './data/flashcards.js';
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

export default function App() {
  const [view, setView] = useState('home');
  const [selectedTopics, setSelectedTopics] = useState(
    () => new Set(Object.keys(topics))
  );
  const [pool, setPool] = useState([]);
  const [doneStats, setDoneStats] = useState({ learned: 0, practice: 0 });

  const { progress, mark, reset, storageAvailable } = useProgress();

  const toggleTopic = (id) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startSession = () => {
    const ids = flashcards
      .filter((c) => selectedTopics.has(c.topic))
      .map((c) => c.id);
    if (ids.length === 0) return;
    setPool(shuffle(ids));
    setView('study');
  };

  const startPracticeAgain = () => {
    const practiceIds = Object.keys(progress).filter(
      (id) => progress[id] === 'practice'
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

  const hasPractice = Object.values(progress).some((s) => s === 'practice');

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          selectedTopics={selectedTopics}
          onToggleTopic={toggleTopic}
          onStart={startSession}
          progress={progress}
          onReset={reset}
          storageAvailable={storageAvailable}
        />
      )}
      {view === 'study' && (
        <Study
          pool={pool}
          cards={flashcards}
          onMark={mark}
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
