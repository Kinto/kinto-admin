import type { GroupState, GroupResource } from "../types";
import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_NEXT_REQUEST,
  GROUP_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";
import { paginator } from "./shared";

export const INITIAL_STATE: GroupState = {
  data: null,
  busy: false,
  permissions: {
    read: [],
    write: [],
  },
  history: paginator(undefined, { type: "@@INIT" }),
  historyLoaded: false,
  hasNextHistory: false,
  listNextHistory: null,
};

function load(state: GroupState, group: GroupResource): GroupState {
  if (!group) {
    return { ...state, busy: false };
  }
  const { permissions, data } = group;
  return { ...state, busy: false, data, permissions };
}

export function group(
  state: GroupState = INITIAL_STATE,
  action: any
): GroupState {
  switch (action.type) {
    case GROUP_BUSY: {
      const { busy }: { busy: boolean } = action;
      return { ...state, busy };
    }
    case ROUTE_LOAD_REQUEST: {
      return { ...INITIAL_STATE, busy: true };
    }
    case ROUTE_LOAD_SUCCESS: {
      return load(state, action.group);
    }
    case ROUTE_LOAD_FAILURE: {
      return { ...state, busy: false };
    }
    case GROUP_RESET: {
      return INITIAL_STATE;
    }
    case GROUP_HISTORY_REQUEST:
    case GROUP_HISTORY_NEXT_REQUEST:
    case GROUP_HISTORY_SUCCESS: {
      return { ...state, history: paginator(state.history, action) };
    }
    default: {
      return state;
    }
  }
}

export default group;
