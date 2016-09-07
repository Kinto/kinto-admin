/* @flow */

import type { RecordState, RecordData, RecordPermissions } from "../types";
import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../constants";


const INITIAL_STATE: RecordState = {
  data: {},
  permissions: {
    read: [],
    write: [],
  }
};

export default function record(
  state: RecordState = INITIAL_STATE,
  action: Object // XXX: "type: string" + arbitrary keys
): RecordState {
  switch(action.type) {
    case RECORD_LOAD_SUCCESS: {
      const {data, permissions}: {
        data: RecordData,
        permissions: RecordPermissions
      } = action;
      return {...state, data, permissions};
    }
    case RECORD_RESET: {
      return INITIAL_STATE;
    }
    default: {
      return state;
    }
  }
}
