import { RECORD_LOADED, RECORD_RESET } from "../actions/record";


const INITIAL_STATE = {};

export default function record(state = INITIAL_STATE, action) {
  switch(action.type) {
    case RECORD_LOADED: {
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
