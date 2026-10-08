import { useMemo, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function parse(raw: string | null) {
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch (ex) {
    console.error("Error retrieving value from localStorage", ex);
    return undefined;
  }
}

export function useLocalStorage(key: string, initialValue: any) {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key));
  const stored = useMemo(() => parse(raw), [raw]);
  const val = stored === undefined ? initialValue : stored;

  const setStoredVal = val => {
    try {
      if (val === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
    } catch (ex) {
      console.error("Error setting value in localStorage", ex);
      return;
    }
    // Browsers only fire "storage" events in other tabs, so dispatch one
    // here to notify subscribers in this tab too.
    window.dispatchEvent(new StorageEvent("storage", { key }));
  };

  return [val, setStoredVal];
}
