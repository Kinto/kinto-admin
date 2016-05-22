import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../constants";


const INITIAL_STATE = {};

export default function record(state = INITIAL_STATE, action) {
  switch(action.type) {
    case RECORD_LOAD_SUCCESS: {
      return action.record;
    }
    case RECORD_RESET: {
      return INITIAL_STATE;
    }
    default: {
      return state;
    }
  }
}
