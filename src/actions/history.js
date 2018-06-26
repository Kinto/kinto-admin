/* @flow */

import { HISTORY_ADD, HISTORY_CLEAR } from "../constants";

export function addHistory(
  server: string,
  authType: string
): {
  type: "HISTORY_ADD",
  server: string,
  authType: string,
} {
  return { type: HISTORY_ADD, server, authType };
}

export function clearHistory(): {
  type: "HISTORY_CLEAR",
} {
  return { type: HISTORY_CLEAR };
}
