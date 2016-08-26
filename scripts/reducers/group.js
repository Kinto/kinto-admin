/* @flow */

import type { GroupState, GroupData, GroupPermissions } from "../types";
import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_LOAD_SUCCESS,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_SUCCESS,
} from "../constants";
import { omit } from "../utils";

export const INITIAL_STATE: GroupState = {
  id: null,
  members: [],
  data: {},
  busy: false,
  permissions: {
    "read": [],
    "write": []
  },
  history: [],
  historyLoaded: false,
};

export function group(
  state: GroupState = INITIAL_STATE,
  action: Object
): GroupState {
  switch (action.type) {
    case GROUP_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case GROUP_RESET: {
      return INITIAL_STATE;
    }
    case GROUP_LOAD_SUCCESS: {
      const {data, permissions}: {
        data: GroupData,
        permissions: GroupPermissions,
      } = action;
      const {id, members} = data;
      const {read=[], write=[]} = permissions;
      return {
        ...state,
        id,
        members,
        data: omit(data, ["id", "last_modified", "members"]),
        busy: false,
        permissions: {read, write}
      };
    }
    case GROUP_HISTORY_REQUEST: {
      return {...state, historyLoaded: false};
    }
    case GROUP_HISTORY_SUCCESS: {
      return {...state, history: action.history, historyLoaded: true};
    }
    default: {
      return state;
    }
  }
}

export default group;
