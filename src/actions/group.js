/* @flow */

import type { HistoryFilters, ResourceHistoryEntry } from "../types";

import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_SUCCESS,
} from "../constants";


export function groupBusy(busy: boolean): {
  type: "GROUP_BUSY",
  busy: boolean,
} {
  return {type: GROUP_BUSY, busy};
}

export function resetGroup(): {
  type: "GROUP_RESET",
} {
  return {type: GROUP_RESET};
}

export function listGroupHistory(bid: string, gid: string, filters: HistoryFilters = {}): {
  type: "GROUP_HISTORY_REQUEST",
  bid: string,
  gid: string,
  filters: HistoryFilters,
} {
  return {type: GROUP_HISTORY_REQUEST, bid, gid, filters};
}

export function listGroupHistorySuccess(history: ResourceHistoryEntry[]): {
  type: "GROUP_HISTORY_SUCCESS",
  history: ResourceHistoryEntry[],
} {
  return {type: GROUP_HISTORY_SUCCESS, history};
}
