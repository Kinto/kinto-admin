/* @flow */
import type { SessionState } from "../types";

const HISTORY_KEY = "kinto-admin-server-history";
const SESSION_KEY = "kinto-admin-session";

export function loadHistory(): string[] {
  const jsonHistory = sessionStorage.getItem(HISTORY_KEY);
  if (!jsonHistory) {
    return [];
  }
  try {
    return JSON.parse(jsonHistory);
  } catch (err) {
    return [];
  }
}

export function saveHistory(history: string[]): string[] {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    // Not much to do here, let's fail silently
  } finally {
    return history;
  }
}

export function clearHistory(): string[] {
  return saveHistory([]);
}

export function loadSession(): ?Object {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch (err) {
    return null;
  }
}

export function saveSession(sessionState: SessionState): Promise<any> {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...sessionState,
      buckets: [],
    })
  );
  return Promise.resolve();
}

export function clearSession(): Promise<any> {
  sessionStorage.removeItem(SESSION_KEY);
  return Promise.resolve();
}
