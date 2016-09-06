/* @flow */

import type { Action } from "../types";

import { HISTORY_ADD, HISTORY_CLEAR } from "../constants";


export function addHistory(entry: string): Action {
  return {type: HISTORY_ADD, entry};
}

export function clearHistory(): Action {
  return {type: HISTORY_CLEAR};
}
