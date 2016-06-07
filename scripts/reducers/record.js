import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../constants";


const INITIAL_STATE = {
  data: {},
  permissions: {
    read: [],
    write: [],
  }
};

export default function record(state = INITIAL_STATE, action) {
  switch(action.type) {
    case RECORD_LOAD_SUCCESS: {
      const {data, permissions={}} = action;
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
