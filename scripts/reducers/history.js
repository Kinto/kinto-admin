/* @flow */

import { HISTORY_ADD } from "../constants";


function load(): string[] {
  const jsonHistory = localStorage.getItem("kinto-admin-server-history");
  if (!jsonHistory) {
    return [];
  }
  try {
    return JSON.parse(jsonHistory);
  } catch(err) {
    return [];
  }
}

function save(history): string[] {
  try {
    localStorage.setItem("kinto-admin-server-history", JSON.stringify(history));
  } catch(err) {
    // Not much to do here, let's fail silently
  } finally {
    return history;
  }
}

const INITIAL_STATE: string[] = load();

export default function history(
  state: string[] = INITIAL_STATE,
  action: Object
): string[] {
  switch(action.type) {
    case HISTORY_ADD: {
      return save(Array.from(new Set([action.entry, ...state])));
    }
    default: {
      return state;
    }
  }
}
