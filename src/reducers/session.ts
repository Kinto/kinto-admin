import type { ServerInfo, SessionState, AuthData } from "../types";
import {
  SESSION_BUSY,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_STORE_REDIRECT_URL,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_PERMISSIONS_SUCCESS,
  SESSION_AUTHENTICATED,
  SESSION_AUTHENTICATION_FAILED,
  SESSION_BUCKETS_REQUEST,
  SESSION_BUCKETS_SUCCESS,
  SESSION_LOGOUT,
} from "../constants";

export const DEFAULT_SERVERINFO: ServerInfo = {
  url: "",
  capabilities: {},
  project_name: "Kinto",
  project_docs: "",
};

const DEFAULT: SessionState = {
  busy: false,
  authenticating: false,
  auth: null,
  authenticated: false,
  permissions: null,
  buckets: [],
  serverInfo: DEFAULT_SERVERINFO,
  redirectURL: null,
};

export default function session(
  state: SessionState = DEFAULT,
  action: any
): SessionState {
  switch (action.type) {
    case SESSION_BUSY: {
      const { busy }: { busy: boolean } = action;
      return { ...state, busy };
    }
    case SESSION_SETUP: {
      return { ...state, authenticating: true };
    }
    case SESSION_SETUP_COMPLETE: {
      const { auth }: { auth: AuthData } = action;
      return { ...state, auth, authenticating: false };
    }
    case SESSION_STORE_REDIRECT_URL: {
      const { redirectURL }: { redirectURL: string } = action;
      return { ...state, redirectURL };
    }
    case SESSION_BUCKETS_REQUEST: {
      return { ...state, busy: true };
    }
    case SESSION_BUCKETS_SUCCESS: {
      const { serverInfo } = state;
      const userBucket = serverInfo.user && serverInfo.user.bucket;
      return {
        ...state,
        busy: false,
        buckets: action.buckets.map(bucket => {
          return {
            ...bucket,
            id: bucket.id === userBucket ? "default" : bucket.id,
          };
        }),
      };
    }
    case SESSION_SERVERINFO_SUCCESS: {
      const { serverInfo } = action;
      return { ...state, serverInfo };
    }
    case SESSION_PERMISSIONS_SUCCESS: {
      const { permissions } = action;
      return { ...state, permissions };
    }
    case SESSION_AUTHENTICATED: {
      return { ...state, authenticated: true };
    }
    case SESSION_AUTHENTICATION_FAILED: {
      return { ...state, authenticating: false, authenticated: false };
    }
    case SESSION_LOGOUT: {
      return { ...DEFAULT, serverInfo: state.serverInfo };
    }
    default: {
      return state;
    }
  }
}
