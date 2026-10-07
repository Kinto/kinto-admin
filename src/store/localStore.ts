import { ANONYMOUS_AUTH } from "@src/constants";
import type { ServerEntry } from "@src/types";

const HISTORY_KEY = "kinto-admin-server-history";

export function loadServers(): ServerEntry[] {
  const jsonHistory = localStorage.getItem(HISTORY_KEY);
  if (!jsonHistory) {
    return [];
  }
  try {
    const history = JSON.parse(jsonHistory);
    // Cope with legacy history which only stored the server as a string, without the authType.
    const withLegacyHistory = history.map(entry =>
      typeof entry === "string"
        ? { server: entry, authType: ANONYMOUS_AUTH }
        : entry
    );
    return withLegacyHistory;
  } catch (_err) {
    return [];
  }
}

export function saveServers(history: ServerEntry[]): ServerEntry[] {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (_err) {
    // Not much to do here, let's fail silently
  }

  return history;
}

export function clearServers(): ServerEntry[] {
  return saveServers([]);
}
