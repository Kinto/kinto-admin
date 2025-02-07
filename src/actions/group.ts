import {
  GROUP_BUSY,
  GROUP_HISTORY_NEXT_REQUEST,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_SUCCESS,
  GROUP_RESET,
} from "@src/constants";
import type { ResourceHistoryEntry, SagaNextFunction } from "@src/types";

export function groupBusy(busy: boolean): {
  type: "GROUP_BUSY";
  busy: boolean;
} {
  return { type: GROUP_BUSY, busy };
}

export function resetGroup(): {
  type: "GROUP_RESET";
} {
  return { type: GROUP_RESET };
}

export function listGroupHistory(
  bid: string,
  gid: string
): {
  type: "GROUP_HISTORY_REQUEST";
  bid: string;
  gid: string;
} {
  return { type: GROUP_HISTORY_REQUEST, bid, gid };
}

export function listGroupNextHistory(): {
  type: "GROUP_HISTORY_NEXT_REQUEST";
} {
  return { type: GROUP_HISTORY_NEXT_REQUEST };
}

export function listGroupHistorySuccess(
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: SagaNextFunction | null | undefined
): {
  type: "GROUP_HISTORY_SUCCESS";
  entries: ResourceHistoryEntry[];
  hasNextPage: boolean;
  next: SagaNextFunction | null | undefined;
} {
  return { type: GROUP_HISTORY_SUCCESS, entries, hasNextPage, next };
}
