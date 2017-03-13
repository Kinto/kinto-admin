/* @flow */

import { HISTORY_ADD, HISTORY_CLEAR } from "../constants";

export function addHistory(
  entry: string
): {
  type: "HISTORY_ADD",
  entry: string,
} {
  return { type: HISTORY_ADD, entry };
}

export function clearHistory(): {
  type: "HISTORY_CLEAR",
} {
  return { type: HISTORY_CLEAR };
}
