"use client";

import { useEffect, useState } from "react";

/**
 * localStorage-backed state. Starts at `initial` during SSR/first paint and
 * syncs from storage in an effect, so server and client markup match.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full / unavailable - fail silently
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}
