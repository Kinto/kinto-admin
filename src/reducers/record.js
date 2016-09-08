/* @flow */

import type { RecordState, RecordResource } from "../types";
import {
  RECORD_RESET,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";


const INITIAL_STATE: RecordState = {
  busy: false,
  data: {},
  permissions: {
    read: [],
    write: [],
  }
};

function load(state: RecordState, record: RecordResource): RecordState {
  if (!record) {
    return {...state, busy: false};
  }
  const {data, permissions} = record;
  return {...state, busy: false, data, permissions};
}

export default function record(
  state: RecordState = INITIAL_STATE,
  action: Object // XXX: "type: string" + arbitrary keys
): RecordState {
  switch(action.type) {
    case ROUTE_LOAD_REQUEST: {
      return {...INITIAL_STATE, busy: true};
    }
    case ROUTE_LOAD_SUCCESS: {
      return load(state, action.record);
    }
    case ROUTE_LOAD_FAILURE: {
      return {...state, busy: false};
    }
    case RECORD_RESET: {
      return INITIAL_STATE;
    }
    default: {
      return state;
    }
  }
}
