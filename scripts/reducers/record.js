/* @flow */

import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../constants";


export type RecordData = {
  id?: string,
  last_modified?: number
};

export type RecordPermissions = {
  read: Array<string>,
  write: Array<string>,
};

export type Record = {
  data: RecordData,
  permissions: RecordPermissions,
};

const INITIAL_STATE: Record = {
  data: {},
  permissions: {
    read: [],
    write: [],
  }
};

export default function record(state: Record = INITIAL_STATE, action: Object): Record {
  switch(action.type) {
    case RECORD_LOAD_SUCCESS: {
      const {data, permissions} = action;
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
