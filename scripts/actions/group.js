/* @flow */

import type {
  Action,
  Group,
  GroupPermissions,
} from "../types";

import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_LOAD_SUCCESS,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_SUCCESS,
} from "../constants";


export function groupBusy(busy: boolean): Action {
  return {type: GROUP_BUSY, busy};
}

export function resetGroup(): Action {
  return {type: GROUP_RESET};
}

export function groupLoadSuccess(
  data: Group,
  permissions: GroupPermissions
): Action {
  return {type: GROUP_LOAD_SUCCESS, data, permissions};
}

export function listGroupHistory(bid: string, gid: string): Action {
  return {type: GROUP_HISTORY_REQUEST, bid, gid};
}

export function listGroupHistorySuccess(history: Object[]): Action {
  return {type: GROUP_HISTORY_SUCCESS, history};
}
