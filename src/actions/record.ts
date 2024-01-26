import {
  RECORD_BUSY,
  RECORD_HISTORY_NEXT_REQUEST,
  RECORD_HISTORY_REQUEST,
  RECORD_HISTORY_SUCCESS,
  RECORD_RESET,
} from "@src/constants";
import type { ResourceHistoryEntry } from "@src/types";

export function recordBusy(busy: boolean): {
  type: "RECORD_BUSY";
  busy: boolean;
} {
  return { type: RECORD_BUSY, busy };
}

export function resetRecord(): {
  type: "RECORD_RESET";
} {
  return { type: RECORD_RESET };
}

export function listRecordHistory(
  bid: string,
  cid: string,
  rid: string
): {
  type: "RECORD_HISTORY_REQUEST";
  bid: string;
  cid: string;
  rid: string;
} {
  return { type: RECORD_HISTORY_REQUEST, bid, cid, rid };
}

export function listRecordNextHistory(): {
  type: "RECORD_HISTORY_NEXT_REQUEST";
} {
  return { type: RECORD_HISTORY_NEXT_REQUEST };
}

export function listRecordHistorySuccess(
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: Function | null | undefined
): {
  type: "RECORD_HISTORY_SUCCESS";
  entries: ResourceHistoryEntry[];
  hasNextPage: boolean;
  next: Function | null | undefined;
} {
  return { type: RECORD_HISTORY_SUCCESS, entries, hasNextPage, next };
}
