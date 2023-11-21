import { useState, useEffect } from "react";

export const storageKeys = {
  useSimpleReview: "useSimpleReview",
};

export function useLocalStorage(key: string, initialValue: any) {
  const [val, setVal] = useState(() => {
    try {
      return localStorage[key] ? JSON.parse(localStorage[key]) : initialValue;
    } catch (ex) {
      console.error("Error retrieving value from localStorage", ex);
      return initialValue;
    }
  });

  const setStoredVal = val => {
    try {
      localStorage[key] = JSON.stringify(val);
      setVal(val);
    } catch (ex) {
      console.error("Error setting value in localStorage", ex);
    }
  };

  useEffect(() => {
    // will fire if localStorage is touched in another browser tab/window
    const handleStorageChange = (evt: StorageEvent) => {
      if (evt.key !== key) {
        return;
      }
      setVal(evt.newValue ? JSON.parse(evt.newValue) : undefined);
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [val, setStoredVal];
}
