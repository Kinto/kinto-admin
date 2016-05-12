import {
  SESSION_SETUP_COMPLETE,
  SESSION_BUCKETS,
  SESSION_LOGOUT,
} from "../actions/session";


const DEFAULT = {authenticated: false, buckets: []};

export default function session(state = DEFAULT, action) {
  switch (action.type) {
  case SESSION_SETUP_COMPLETE:
    return {...state, ...action.session, authenticated: true};
  case SESSION_BUCKETS:
    return {...state, buckets: action.buckets};
  case SESSION_LOGOUT:
    return DEFAULT;
  default:
    return state;
  }
}
