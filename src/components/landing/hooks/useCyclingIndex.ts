import { useEffect, useState, useCallback } from 'react';

export function useCyclingIndex(length: number, intervalMs = 4000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  const select = useCallback((i: number) => setIndex(i), []);

  return { index, select };
}
