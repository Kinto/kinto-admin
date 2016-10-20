/* @flow */

import type {
  Action,
  HistoryFilters
} from "../types";

import {
  RECORD_BUSY,
  RECORD_RESET,
  RECORD_HISTORY_REQUEST,
  RECORD_HISTORY_SUCCESS,
} from "../constants";


export function recordBusy(busy: boolean): Action {
  return {type: RECORD_BUSY, busy};
}

export function resetRecord(): Action {
  return {type: RECORD_RESET};
}

export function listRecordHistory(bid: string, cid: string, rid: string, filters: HistoryFilters = {}): Action {
  return {type: RECORD_HISTORY_REQUEST, bid, cid, rid, filters};
}

export function listRecordHistorySuccess(history: Object[]): Action {
  return {type: RECORD_HISTORY_SUCCESS, history};
}
