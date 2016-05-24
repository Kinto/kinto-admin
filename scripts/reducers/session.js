import {
  SESSION_BUSY,
  SESSION_SETUP_COMPLETE,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_BUCKETS_SUCCESS,
  SESSION_LOGOUT,
} from "../constants";


const DEFAULT = {
  busy: false,
  authenticated: false,
  server: null,
  credentials: {},
  buckets: [],
  serverInfo: {},
};

export default function session(state = DEFAULT, action) {
  switch (action.type) {
    case SESSION_BUSY: {
      return {...state, busy: action.busy};
    }
    case SESSION_SETUP_COMPLETE: {
      return {...state, ...action.session};
    }
    case SESSION_BUCKETS_SUCCESS: {
      const {serverInfo} = state;
      const userBucket = serverInfo.user && serverInfo.user.bucket;
      return {
        ...state,
        authenticated: true,
        buckets: action.buckets.map((bucket) => {
          return {
            ...bucket,
            id: bucket.id === userBucket ? "default" : bucket.id
          };
        }),
      };
    }
    case SESSION_SERVERINFO_SUCCESS: {
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
