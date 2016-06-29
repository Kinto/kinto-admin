/* @flow */

import type { Action } from "../types";

import { HISTORY_ADD } from "../constants";


export function addHistory(entry: string): Action {
  return {type: HISTORY_ADD, entry};
}
