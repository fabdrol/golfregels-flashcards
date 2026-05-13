import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'golfregels.progress.v1';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => readStorage());
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const testKey = '__golfregels_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch {
      setStorageAvailable(false);
    }
  }, []);

  const mark = useCallback((cardId, status) => {
    setProgress((prev) => {
      const next = { ...prev, [cardId]: status };
      writeStorage(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { progress, mark, reset, storageAvailable };
}
