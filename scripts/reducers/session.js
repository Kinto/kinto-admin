/* @flow */

import type { Session } from "../types";
import {
  SESSION_BUSY,
  SESSION_SETUP_COMPLETE,
  SESSION_STORE_REDIRECT_URL,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_BUCKETS_SUCCESS,
  SESSION_LOGOUT,
} from "../constants";


const DEFAULT: Session = {
  busy: false,
  authenticated: false,
  server: null,
  credentials: {},
  buckets: [],
  serverInfo: {
    capabilities: {},
    user: {},
  },
  redirectURL: null,
};

export default function session(
  state: Session = DEFAULT,
  action: Object
): Session {
  switch (action.type) {
    case SESSION_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case SESSION_SETUP_COMPLETE: {
      const {session}: {session: Session} = action;
      return {...state, ...session};
    }
    case SESSION_STORE_REDIRECT_URL: {
      const {redirectURL}: {redirectURL: string} = action;
      return {...state, redirectURL};
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
      const {serverInfo} = action;
      return {...state, serverInfo};
    }
    case SESSION_LOGOUT: {
      return DEFAULT;
    }
    default: {
      return state;
    }
  }
}
