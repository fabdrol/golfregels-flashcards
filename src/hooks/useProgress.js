import { useState, useCallback, useEffect } from 'react';

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function useProgress(storageKey) {
  const [progress, setProgress] = useState(() => readStorage(storageKey));
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
      writeStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { progress, mark, reset, storageAvailable };
}
