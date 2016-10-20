/* @flow */

import type {
  Action,
  HistoryFilters
} from "../types";

import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_SUCCESS,
} from "../constants";


export function groupBusy(busy: boolean): Action {
  return {type: GROUP_BUSY, busy};
}

export function resetGroup(): Action {
  return {type: GROUP_RESET};
}

export function listGroupHistory(bid: string, gid: string, filters: HistoryFilters = {}): Action {
  return {type: GROUP_HISTORY_REQUEST, bid, gid, filters};
}

export function listGroupHistorySuccess(history: Object[]): Action {
  return {type: GROUP_HISTORY_SUCCESS, history};
}
