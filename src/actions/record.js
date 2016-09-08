/* @flow */

import type { Action } from "../types";

import { RECORD_BUSY, RECORD_RESET } from "../constants";


export function recordBusy(busy: boolean): Action {
  return {type: RECORD_BUSY, busy};
}

export function resetRecord(): Action {
  return {type: RECORD_RESET};
}
