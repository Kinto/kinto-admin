/* @flow */

import { HISTORY_ADD, HISTORY_CLEAR } from "../constants";
import { loadHistory, saveHistory, clearHistory } from "../store/localStore";

const INITIAL_STATE: string[] = loadHistory();

export default function history(
  state: string[] = INITIAL_STATE,
  action: Object
): string[] {
  switch (action.type) {
    case HISTORY_ADD: {
      return saveHistory(Array.from(new Set([action.entry, ...state])));
    }
    case HISTORY_CLEAR: {
      return clearHistory();
    }
    default: {
      return state;
    }
  }
}
