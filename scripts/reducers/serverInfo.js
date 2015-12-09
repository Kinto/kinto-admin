import { SERVERINFO_LOADED, SERVERINFO_RESET } from "../actions/serverInfo";

const INITIAL_STATE = {};

export default function serverInfo(state = INITIAL_STATE, action) {
  switch(action.type) {
  case SERVERINFO_LOADED:
    return {...state, ...action.serverInfo};
  case SERVERINFO_RESET:
    return INITIAL_STATE;
  default:
    return state;
  }
}
