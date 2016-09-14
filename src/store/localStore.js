/* @flow */
import type { SessionState } from "../types";


const HISTORY_KEY = "kinto-admin-server-history";
const SESSION_KEY = "kinto-admin-session";


export function loadHistory(): string[] {
  const jsonHistory = localStorage.getItem(HISTORY_KEY);
  if (!jsonHistory) {
    return [];
  }
  try {
    return JSON.parse(jsonHistory);
  } catch(err) {
    return [];
  }
}

export function saveHistory(history: string[]): string[] {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch(err) {
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
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch(err) {
    return null;
  }
}

export function saveSession(sessionState: SessionState) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ... sessionState,
    buckets: [],
  }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
