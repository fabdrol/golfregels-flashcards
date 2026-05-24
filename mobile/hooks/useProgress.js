import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useProgress(storageKey) {
  const [progress, setProgress] = useState({});
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') setProgress(parsed);
        }
      } catch {
        if (!cancelled) setStorageAvailable(false);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, [storageKey]);

  const mark = useCallback((cardId, status) => {
    setProgress((prev) => {
      const next = { ...prev, [cardId]: status };
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {
        setStorageAvailable(false);
      });
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setProgress({});
    AsyncStorage.removeItem(storageKey).catch(() => {});
  }, [storageKey]);

  return { progress, mark, reset, storageAvailable, hydrated };
}
