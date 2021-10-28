import type {
  AuthData,
  BucketEntry,
  PermissionsListEntry,
  ServerInfo,
  SessionState,
} from "../types";

import type { ActionType } from "../types";

import { notifyError } from "../actions/notifications";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const DEFAULT_SERVERINFO: ServerInfo = {
  url: "",
  capabilities: {},
  project_name: "Kinto",
  project_docs: "",
};

const initialState: SessionState = {
  busy: false,
  authenticating: false,
  auth: null,
  authenticated: false,
  permissions: null,
  buckets: [],
  serverInfo: DEFAULT_SERVERINFO,
  redirectURL: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionBusy(state, action: PayloadAction<boolean>) {
      state.busy = action.payload;
    },
    setupSession(state, _action: PayloadAction<AuthData>) {
      state.authenticating = true;
    },
    setupComplete(state, action: PayloadAction<AuthData>) {
      state.auth = action.payload;
      state.authenticating = false;
    },
    storeRedirectURL(state, action: PayloadAction<string | null | undefined>) {
      state.redirectURL = action.payload;
    },
    listBuckets(state) {
      state.busy = true;
    },
    bucketsSuccess(state, action: PayloadAction<BucketEntry[]>) {
      const { serverInfo } = state;
      const userBucket = serverInfo.user && serverInfo.user.bucket;
      state.busy = false;
      state.buckets = action.payload.map(bucket => {
        return {
          ...bucket,
          id: bucket.id === userBucket ? "default" : bucket.id,
        };
      });
    },
    serverChange(state) {},
    getServerInfo(state, action: PayloadAction<AuthData>) {},
    serverInfoSuccess(state, action: PayloadAction<ServerInfo>) {
      state.serverInfo = action.payload;
    },
    permissionsListSuccess(
      state,
      action: PayloadAction<PermissionsListEntry[]>
    ) {
      state.permissions = action.payload;
    },
    setAuthenticated(state) {
      state.authenticated = true;
    },
    authenticationFailed(state) {
      state.authenticating = false;
      state.authenticated = false;
    },
    copyAuthenticationHeader(state) {},
    logout(state) {
      return {
        ...initialState,
        serverInfo: state.serverInfo,
      };
    },
  },
});

type NavigationResult = ActionType<typeof notifyError> | { type: null };

const navigateToFxA = (server: string, redirect: string): NavigationResult => {
  document.location.href = `${server}/fxa-oauth/login?redirect=${encodeURIComponent(
    redirect
  )}`;
  return { type: null };
};

const postToPortier = (server: string, redirect: string): NavigationResult => {
  // Alter the AuthForm to make it posting Portier auth information to the
  // dedicated Kinto server endpoint. This is definitely one of the ugliest
  // part of this project, but it works :)
  try {
    const portierUrl = `${server}/portier/login`.replace(
      "//portier",
      "/portier"
    );
    const form = document.querySelector("form.rjsf");
    if (!(form instanceof HTMLFormElement)) {
      return notifyError("Missing authentication form.");
    }
    form.setAttribute("method", "post");
    form.setAttribute("action", portierUrl);
    const emailInput = form.querySelector("#root_email");
    if (!emailInput) {
      return notifyError("Couldn't find email input widget in form.");
    }
    emailInput.setAttribute("name", "email");
    const hiddenRedirect = document.createElement("input");
    hiddenRedirect.setAttribute("type", "hidden");
    hiddenRedirect.setAttribute("name", "redirect");
    hiddenRedirect.setAttribute("value", redirect);
    form.appendChild(hiddenRedirect);
    form.submit();
    return { type: null };
  } catch (error) {
    return notifyError("Couldn't redirect to authentication endpoint.", error);
  }
};

export const navigateToOpenID = (
  authFormData: any,
  provider: any
): NavigationResult => {
  const { origin, pathname } = document.location;
  const { server } = authFormData;
  const strippedServer = server.replace(/\/$/, "");
  const { auth_path: authPath } = provider;
  const strippedAuthPath = authPath.replace(/^\//, "");
  const payload = btoa(JSON.stringify(authFormData));
  const redirect = encodeURIComponent(`${origin}${pathname}#/auth/${payload}/`);
  document.location.href = `${strippedServer}/${strippedAuthPath}?callback=${redirect}&scope=openid email`;
  return { type: null };
};

/**
 * Massive side effect: this will navigate away from the current page to perform
 * authentication to a third-party service, like FxA.
 */
export function navigateToExternalAuth(authFormData: any): NavigationResult {
  const { origin, pathname } = document.location;
  const { server, authType } = authFormData;
  try {
    const payload = btoa(JSON.stringify(authFormData));
    const redirect = `${origin}${pathname}#/auth/${payload}/`;
    if (authType === "fxa") {
      return navigateToFxA(server, redirect);
    } else if (authType === "portier") {
      return postToPortier(server, redirect);
    } else {
      return notifyError(`Unsupported auth navigation type "${authType}".`);
    }
  } catch (error) {
    return notifyError("Couldn't redirect to authentication endpoint.", error);
  }
}

export const sessionActions = {
  ...sessionSlice.actions,
  navigateToFxA,
  navigateToExternalAuth,
  navigateToOpenID,
};

export default sessionSlice.reducer;
