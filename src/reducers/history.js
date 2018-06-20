/* @flow */

import type { ServerHistoryEntry } from "../types";
import { HISTORY_ADD, HISTORY_CLEAR } from "../constants";
import { loadHistory, saveHistory, clearHistory } from "../store/localStore";

const INITIAL_STATE: ServerHistoryEntry[] = loadHistory();

export default function history(
  state: ServerHistoryEntry[] = INITIAL_STATE,
  action: Object
): ServerHistoryEntry[] {
  switch (action.type) {
    case HISTORY_ADD: {
      return saveHistory(
        Array.from(
          new Set([
            { server: action.server, authType: action.authType },
            ...state,
          ])
        )
      );
    }
    case HISTORY_CLEAR: {
      return clearHistory();
    }
    default: {
      return state;
    }
  }
}
