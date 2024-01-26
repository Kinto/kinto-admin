import { paginator } from "./shared";
import {
  RECORD_BUSY,
  RECORD_CREATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_HISTORY_NEXT_REQUEST,
  RECORD_HISTORY_REQUEST,
  RECORD_HISTORY_SUCCESS,
  RECORD_RESET,
  RECORD_UPDATE_REQUEST,
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "@src/constants";
import type { RecordResource, RecordState } from "@src/types";

const INITIAL_STATE: RecordState = {
  busy: false,
  data: {},
  permissions: {
    read: [],
    write: [],
  },
  history: paginator(undefined, { type: "@@INIT" }),
};

function load(state: RecordState, record: RecordResource): RecordState {
  if (!record) {
    return { ...state, busy: false };
  }
  const { data, permissions } = record;
  return { ...state, busy: false, data, permissions };
}

export default function record(
  state: RecordState = INITIAL_STATE,
  action: any // XXX: "type: string" + arbitrary keys
): RecordState {
  switch (action.type) {
    case RECORD_BUSY: {
      return { ...state, busy: action.busy };
    }
    case RECORD_CREATE_REQUEST:
    case RECORD_UPDATE_REQUEST:
    case RECORD_DELETE_REQUEST: {
      return { ...state, busy: true };
    }
    case ROUTE_LOAD_REQUEST: {
      return { ...INITIAL_STATE, busy: true };
    }
    case ROUTE_LOAD_SUCCESS: {
      return load(state, action.record);
    }
    case ROUTE_LOAD_FAILURE: {
      return { ...state, busy: false };
    }
    case RECORD_RESET: {
      return INITIAL_STATE;
    }
    case RECORD_HISTORY_REQUEST:
    case RECORD_HISTORY_NEXT_REQUEST:
    case RECORD_HISTORY_SUCCESS: {
      return { ...state, history: paginator(state.history, action) };
    }
    default: {
      return state;
    }
  }
}
