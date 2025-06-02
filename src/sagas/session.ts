import * as actions from "@src/actions/session";
import {
  getAuthHeader,
  getClient,
  resetClient,
  setupClient,
} from "@src/client";
import {
  clearNotifications,
  notifyError,
  notifySuccess,
} from "@src/hooks/notifications";
import { addServer } from "@src/hooks/servers";
// import { DEFAULT_SERVERINFO } from "@src/reducers/session";
import { clearSession } from "@src/store/localStore";
import type {
  ActionType,
  AuthData,
  GetStateFn,
  OpenIDAuth,
  SagaGen,
} from "@src/types";
import { copyToClipboard, getAuthLabel } from "@src/utils";
import { call, put } from "redux-saga/effects";

export function* serverChange(getState: GetStateFn): SagaGen {
  yield put(actions.serverInfoSuccess(DEFAULT_SERVERINFO));
  clearNotifications();
}

export function* getServerInfo(
  getState: GetStateFn,
  action: ActionType<typeof actions.getServerInfo>
): SagaGen {
  const { auth } = action;
  let processedAuth: AuthData = auth;
  if (auth.authType.startsWith("openid-")) {
    const openIDAuth: OpenIDAuth = {
      authType: "openid",
      provider: auth.authType.replace("openid-", ""),
      server: auth.server,
      // $FlowFixMe we know we are dealing with openid, Flow does not.
      tokenType: (auth as { tokenType: string }).tokenType,
      // $FlowFixMe
      credentials: (auth as { credentials: { token: string } }).credentials,
    };
    processedAuth = openIDAuth;
  }

  // Set the client globally to the entire app, when the saga starts.
  // We'll compare the remote of this singleton when the server info will be received
  // to prevent race conditions.
  const client = setupClient(processedAuth || auth);

  try {
    // Fetch server information
    let serverInfo = yield call([client, client.fetchServerInfo]);

    // Take the project name from the server. Use "Kinto" if default ("kinto") is used.
    const { project_name: rawProjectName } = serverInfo;
    const project_name = rawProjectName == "kinto" ? "Kinto" : rawProjectName;
    serverInfo = { ...serverInfo, project_name };
    // Side effect: change window title with project name.
    document.title = project_name + " Administration";

    // Check that the client was not changed in the mean time. This could happen if a request to
    // another server was sent after the current one, but took less time to answer.
    // In such a case, this means this saga/server request should be discarded in favor of the other one
    // which was sent later.
    const currentClient = getClient();
    if (client.remote != currentClient.remote) {
      return;
    }

    // Notify they're received
    yield put(actions.serverInfoSuccess(serverInfo));
  } catch (error) {
    // As above, we want to ignore this result, if another request was sent in the mean time.
    const currentClient = getClient();
    if (client.remote != currentClient.remote) {
      return;
    }

    // Reset the server info that we might have added previously to the state.
    yield put(actions.serverInfoSuccess(DEFAULT_SERVERINFO));

    notifyError(`Could not reach server ${auth.server}`, error);
  }
}

export function* setupSession(
  getState: GetStateFn,
  action: ActionType<typeof actions.setupSession>
): SagaGen {
  const { auth } = action;
  try {
    // Fetch server information
    yield call(getServerInfo, getState, actions.getServerInfo(auth));

    const {
      session: { serverInfo },
    } = getState();

    // Check that current user was authenticated as expected.
    // Distinguish anonymous from failed authentication using the user info
    // in the server info endpoint.
    //
    // Because of the legacy ``basicauth`` authentication that accepts any credentials,
    // we have to make sure that the user wasn't identified with it by accident.
    //
    // 1. Accept "basicauth" credentials only if explicitly picked in the auth form.
    // 2. Consider valid any non empty user ID with the other auth methods.
    // 3. Accept an empty user ID if *Anonymous* was explicitly picked in the auth form.
    //
    // Note: We cannot guess the userId prefix here from the authentication method,
    // since it not exposed by the server. (eg. *Kinto Accounts* is usually ``account:``...)
    // See https://kinto.readthedocs.io/en/stable/configuration/settings.html#authentication
    const { user: { id: userId } = {} } = serverInfo;
    const { authType } = auth;
    const fullAuthType =
      auth.authType === "openid"
        ? `${auth.authType}-${auth.provider}`
        : authType;
    const authLabel = getAuthLabel(fullAuthType);
    const hasValidCredentials = userId
      ? (authType == "basicauth" && userId.startsWith("basicauth:")) ||
        (authType != "basicauth" && !userId.startsWith("basicauth:"))
      : authType == "anonymous";
    if (!hasValidCredentials) {
      notifyError("Authentication failed.", {
        message: `Could not authenticate with ${authLabel}`,
      });
      // Show back login form.
      yield put(actions.authenticationFailed());
      return;
    }

    // We got a valid response; officially declare current user authenticated.
    // Note, that "authenticated" can also mean "anonymous" if picked in the auth form.
    yield put(actions.setAuthenticated());
    // Store this valid server url in the history
    addServer(serverInfo.url, fullAuthType);
    yield put(actions.setupComplete(auth));
    notifySuccess("Authenticated.", {
      details: [authLabel],
    });
  } catch (error) {
    notifyError("Couldn't complete session setup.", error);
  }
}

export function* sessionLogout(
  getState: GetStateFn,
  action: ActionType<typeof actions.logout>
): SagaGen {
  resetClient();
  notifySuccess("Logged out.");
  yield call(clearSession);
}

export function* sessionCopyAuthenticationHeader(
  getState: GetStateFn,
  action: ActionType<typeof actions.copyAuthenticationHeader>
): SagaGen {
  const {
    session: { auth },
  } = getState();
  if (!auth) {
    return;
  }
  const authHeader = getAuthHeader(auth);
  yield call(copyToClipboard, authHeader);
  notifySuccess("Header copied to clipboard");
}
