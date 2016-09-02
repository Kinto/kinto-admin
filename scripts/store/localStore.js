/* @flow */
import type { Session } from "../types";

import { setupClient } from "../client";


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

export function loadSession(): Object {
  const jsonSession = localStorage.getItem(SESSION_KEY);
  if (!jsonSession) {
    return {};
  }
  try {
    const session = JSON.parse(jsonSession);
    if (!session) {
      return {};
    }
    setupClient(session);
    return {session};
  } catch(err) {
    return {};
  }
}

export function saveSession(sessionState: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionState));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
