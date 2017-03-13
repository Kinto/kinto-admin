/* @flow */

import type { HistoryFilters, ResourceHistoryEntry } from "../types";

import {
  RECORD_BUSY,
  RECORD_RESET,
  RECORD_HISTORY_REQUEST,
  RECORD_HISTORY_NEXT_REQUEST,
  RECORD_HISTORY_SUCCESS,
} from "../constants";

export function recordBusy(
  busy: boolean
): {
  type: "RECORD_BUSY",
  busy: boolean,
} {
  return { type: RECORD_BUSY, busy };
}

export function resetRecord(): {
  type: "RECORD_RESET",
} {
  return { type: RECORD_RESET };
}

export function listRecordHistory(
  bid: string,
  cid: string,
  rid: string,
  filters: HistoryFilters = {}
): {
  type: "RECORD_HISTORY_REQUEST",
  bid: string,
  cid: string,
  rid: string,
  filters: HistoryFilters,
} {
  return { type: RECORD_HISTORY_REQUEST, bid, cid, rid, filters };
}

export function listRecordNextHistory(): {
  type: "RECORD_HISTORY_NEXT_REQUEST",
} {
  return { type: RECORD_HISTORY_NEXT_REQUEST };
}

export function listRecordHistorySuccess(
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: ?Function
): {
  type: "RECORD_HISTORY_SUCCESS",
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: ?Function,
} {
  return { type: RECORD_HISTORY_SUCCESS, entries, hasNextPage, next };
}
