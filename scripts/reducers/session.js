import {
  SESSION_SETUP_COMPLETE,
  SESSION_LOGOUT,
} from "../actions/session";
import {
  CLIENT_BUSY,
  CLIENT_SERVER_INFO_LOADED,
  CLIENT_BUCKETS_LIST_LOADED,
} from "../actions/client";


const DEFAULT = {busy: false, authenticated: false, buckets: [], serverInfo: {}};

export default function session(state = DEFAULT, action) {
  switch (action.type) {
    case CLIENT_BUSY: {
      return {...state, busy: action.busy};
    }
    case SESSION_SETUP_COMPLETE: {
      return {...state, ...action.session, authenticated: true};
    }
    case CLIENT_BUCKETS_LIST_LOADED: {
      return {
        ...state,
        // replace default user bucket id with "default"
        buckets: action.buckets.map((bucket) => {
          if (bucket.id === state.serverInfo.user.bucket) {
            return {...bucket, id: "default"};
          } else {
            return bucket;
          }
        })
      };
    }
    case CLIENT_SERVER_INFO_LOADED: {
      return {...state, serverInfo: action.serverInfo};
    }
    case SESSION_LOGOUT: {
      return DEFAULT;
    }
    default: {
      return state;
    }
  }
}
