import {
  CLIENT_BUSY,
  SESSION_SETUP_COMPLETE,
  SESSION_SERVER_INFO_LOADED,
  SESSION_BUCKETS_LIST_LOADED,
  SESSION_LOGOUT,
} from "../constants";


const DEFAULT = {busy: false, authenticated: false, buckets: [], serverInfo: {}};

export default function session(state = DEFAULT, action) {
  switch (action.type) {
    case CLIENT_BUSY: {
      return {...state, busy: action.busy};
    }
    case SESSION_SETUP_COMPLETE: {
      return {...state, ...action.session};
    }
    case SESSION_BUCKETS_LIST_LOADED: {
      return {...state, buckets: action.buckets};
    }
    case SESSION_SERVER_INFO_LOADED: {
      const {serverInfo} = action;
      return {...state, serverInfo, authenticated: !!serverInfo.user};
    }
    case SESSION_LOGOUT: {
      return DEFAULT;
    }
    default: {
      return state;
    }
  }
}
