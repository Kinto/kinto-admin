/* @flow */

import type { Action, RecordData, RecordPermissions } from "../types";


import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../constants";


export function resetRecord(): Action {
  return {type: RECORD_RESET};
}

export function recordLoadSuccess(data: RecordData, permissions: RecordPermissions): Action {
  return {type: RECORD_LOAD_SUCCESS, data, permissions};
}
