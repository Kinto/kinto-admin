import type { PermissionData } from "kinto-http";
import type {
  AuthData,
  OpenIDAuth,
  ActionType,
  BucketEntry,
  CollectionEntry,
  GetStateFn,
  SagaGen,
} from "../types";

import { push as updatePath } from "redux-first-history";
import { call, put } from "redux-saga/effects";

import { saveSession, clearSession } from "../store/localStore";
import * as notificationActions from "../actions/notifications";
import * as actions from "../actions/session";
import * as serversActions from "../actions/servers";
import { DEFAULT_SERVERINFO } from "../reducers/session";
import { clone, getAuthLabel, copyToClipboard } from "../utils";
import { getClient, setupClient, resetClient, getAuthHeader } from "../client";

export function* serverChange(getState: GetStateFn): SagaGen {
  yield put(actions.serverInfoSuccess(DEFAULT_SERVERINFO));
  yield put(notificationActions.clearNotifications());
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
  const client = setupClient(processedAuth);

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
    yield put(
      notificationActions.notifyError(
        `Could not reach server ${auth.server}`,
        error
      )
    );
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
      yield put(
        notificationActions.notifyError("Authentication failed.", {
          message: `Could not authenticate with ${authLabel}`,
        })
      );
      // Show back login form.
      yield put(actions.authenticationFailed());
      return;
    }

    // We got a valid response; officially declare current user authenticated.
    // Note, that "authenticated" can also mean "anonymous" if picked in the auth form.
    yield put(actions.setAuthenticated());
    // Store this valid server url in the history
    yield put(serversActions.addServer(serverInfo.url, fullAuthType));

    yield put(actions.listBuckets());
    yield put(actions.setupComplete(auth));
    yield put(
      notificationActions.notifySuccess("Authenticated.", {
        details: [authLabel],
      })
    );
  } catch (error) {
    yield put(
      notificationActions.notifyError("Couldn't complete session setup.", error)
    );
  }
}

export function* sessionLogout(
  getState: GetStateFn,
  action: ActionType<typeof actions.logout>
): SagaGen {
  resetClient();
  const state = getState();
  if (state.router.location.pathname !== "/") {
    // We can't push twice the same path using hash history.
    yield put(updatePath("/"));
  }
  yield put(notificationActions.notifySuccess("Logged out."));
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
  yield put(notificationActions.notifySuccess("Header copied to clipboard"));
}

export function expandBucketsCollections(
  buckets: BucketEntry[],
  permissions: PermissionData[]
): BucketEntry[] {
  // Create a copy to avoid mutating the source object
  const bucketsCopy = clone(buckets);

  // Augment the list of bucket and collections with the ones retrieved from
  // the /permissions endpoint
  for (const permission of permissions) {
    if (!Object.prototype.hasOwnProperty.call(permission, "bucket_id")) {
      // e.g. { resource_name: "root" } permission.
      continue;
    }
    // Add any missing bucket to the current list
    let bucket = bucketsCopy.find(b => b.id === permission.bucket_id);
    if (!bucket) {
      bucket = {
        id: permission.bucket_id,
        collections: [],
        permissions: [],
        readonly: true,
        canCreateCollection: true,
      };
      bucketsCopy.push(bucket);
    }
    // We're dealing with bucket permissions
    if (permission.resource_name === "bucket") {
      bucket.permissions = permission.permissions;
      bucket.readonly = !bucket.permissions.some(bp => {
        return ["write", "collection:create"].includes(bp);
      });
      bucket.canCreateCollection =
        bucket.permissions.includes("collection:create");
    }
    if ("collection_id" in permission) {
      // Add any missing collection to the current bucket collections list; note
      // that this will expose collections we have shared records within too.
      let collection = bucket.collections.find(
        c => c.id === permission.collection_id
      );
      if (!collection) {
        collection = {
          id: permission.collection_id,
          permissions: [],
          readonly: true,
        };
        bucket.collections.push(collection);
      }
      // We're dealing with collection permissions
      if (permission.resource_name === "collection") {
        collection.permissions = permission.permissions;
        collection.readonly = !collection.permissions.some(cp => {
          return ["write", "record:create"].includes(cp);
        });
      }
    }
  }

  return bucketsCopy;
}

export function* listBuckets(
  getState: GetStateFn,
  action: ActionType<typeof actions.listBuckets>
): SagaGen {
  try {
    const {
      session: {
        serverInfo: { user: userInfo, capabilities: serverCapabilities },
      },
    } = getState();

    const userBucket = userInfo && userInfo.bucket;

    // Retrieve and build the list of buckets
    const client = getClient();
    let data;
    try {
      data = (yield call([client, client.listBuckets])).data;
    } catch (error) {
      // If the user is not allowed to list the buckets, we want
      // to show an empty list.
      if (!/HTTP 40[13]/.test(error.message)) {
        throw error;
      }
      data = [];
    }

    // If the default_bucket plugin is enabled, show the Default bucket first in the list.
    if ("default_bucket" in serverCapabilities && userBucket) {
      let defaultBucket = data.find(b => b.id == userBucket);
      if (!defaultBucket) {
        // It will be shown even if server is empty.
        defaultBucket = { id: userBucket, last_modified: 0 };
      }
      data = [defaultBucket, ...data.filter(b => b.id != userBucket)];
    }

    const responses = yield call([client, client.batch], batch => {
      for (const { id } of data) {
        // When reaching the default bucket by its real id, it does not get created.
        // https://github.com/Kinto/kinto/issues/1791
        batch.bucket(id == userBucket ? "default" : id).listCollections();
      }
    });
    let buckets: BucketEntry[] = data.map((bucket, index) => {
      // Initialize received collections with default permissions and readonly
      // information.
      const { data: rawCollections } = responses[index].body;
      const collections: CollectionEntry[] = rawCollections.map(collection => {
        return {
          ...collection,
          permissions: [],
          readonly: true,
        };
      });
      // Initialize the list of permissions and readonly flag for this bucket;
      // when the permissions endpoint is enabled, we'll fill these with the
      // retrieved data.
      return {
        ...bucket,
        collections,
        permissions: [],
        readonly: true,
        canCreateCollection: true,
      };
    });

    // If the Kinto API version allows it, retrieves all permissions
    if ("permissions_endpoint" in serverCapabilities) {
      const { data: permissions } = yield call(
        [client, client.listPermissions],
        { pages: Infinity, filters: { exclude_resource_name: "record" } }
      );
      buckets = expandBucketsCollections(buckets, permissions);
      yield put(actions.permissionsListSuccess(permissions));
    } else {
      yield put(
        notificationActions.notifyInfo(
          [
            "Permissions endpoint is not enabled on server, ",
            "listed resources in the sidebar might be incomplete.",
          ].join("")
        )
      );
    }

    yield put(actions.bucketsSuccess(buckets));

    // Save current app state
    yield call(saveSession, getState().session);
  } catch (error) {
    yield put(notificationActions.notifyError("Couldn't list buckets.", error));
  }
}
