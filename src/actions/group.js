/* @flow */

import type { HistoryFilters, ResourceHistoryEntry } from "../types";

import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_NEXT_REQUEST,
  GROUP_HISTORY_SUCCESS,
} from "../constants";

export function groupBusy(
  busy: boolean
): {
  type: "GROUP_BUSY",
  busy: boolean,
} {
  return { type: GROUP_BUSY, busy };
}

export function resetGroup(): {
  type: "GROUP_RESET",
} {
  return { type: GROUP_RESET };
}

export function listGroupHistory(
  bid: string,
  gid: string,
  filters: HistoryFilters = {}
): {
  type: "GROUP_HISTORY_REQUEST",
  bid: string,
  gid: string,
  filters: HistoryFilters,
} {
  return { type: GROUP_HISTORY_REQUEST, bid, gid, filters };
}

export function listGroupNextHistory(): {
  type: "GROUP_HISTORY_NEXT_REQUEST",
} {
  return { type: GROUP_HISTORY_NEXT_REQUEST };
}

export function listGroupHistorySuccess(
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: ?Function
): {
  type: "GROUP_HISTORY_SUCCESS",
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: ?Function,
} {
  return { type: GROUP_HISTORY_SUCCESS, entries, hasNextPage, next };
}
