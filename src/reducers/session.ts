import {
  SESSION_AUTHENTICATED,
  SESSION_AUTHENTICATION_FAILED,
  SESSION_BUSY,
  SESSION_LOGOUT,
  SESSION_PERMISSIONS_SUCCESS,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_STORE_REDIRECT_URL,
} from "@src/constants";
import type { AuthData, ServerInfo, SessionState } from "@src/types";

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
