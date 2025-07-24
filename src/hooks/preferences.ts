import { loadPreferences, savePreferences } from "@src/store/localStore";
import { Preferences } from "@src/types";
import { useCallback, useEffect, useState } from "react";


const DEFAULT_PREFERENCES: Preferences = {
    showSidebar: true,
};

export function usePreferences(): [
  Preferences,
  (prefs: Preferences) => Promise<void>,
] {
  const [val, setVal] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    loadPreferences().then(prefs => {
        if (prefs) {  // Only if loaded successfully.
            setVal(prefs);
        };
    });
  }, []);

  const storePreferences = useCallback(async (prefs: Preferences) => {
    setVal(prefs);
    await savePreferences(prefs);
  }, []);

  return [val, storePreferences];
}
