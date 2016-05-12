import {
  SESSION_SETUP_COMPLETE,
  SESSION_BUCKETS,
  SESSION_LOGOUT,
  SESSION_SERVER_INFO,
} from "../actions/session";


const DEFAULT = {authenticated: false, buckets: [], serverInfo: {}};

export default function session(state = DEFAULT, action) {
  switch (action.type) {
  case SESSION_SETUP_COMPLETE:
    return {...state, ...action.session, authenticated: true};
  case SESSION_BUCKETS:
    return {...state, buckets: action.buckets};
  case SESSION_SERVER_INFO:
    return {...state, serverInfo: action.serverInfo};
  case SESSION_LOGOUT:
    return DEFAULT;
  default:
    return state;
  }
}
