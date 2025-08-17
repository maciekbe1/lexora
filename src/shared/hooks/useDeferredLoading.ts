import { useEffect, useRef, useState } from 'react';

/**
 * Adds a small delay before hiding a loading indicator to avoid flicker.
 * - When `loading` becomes true: show immediately.
 * - When `loading` becomes false: keep visible for `delayMs` then hide.
 */
export function useDeferredLoading(loading: boolean, delayMs = 200) {
  const [visible, setVisible] = useState<boolean>(loading);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setVisible(true);
      return;
    }

    // Defer hiding by delayMs
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, delayMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return visible;
}

