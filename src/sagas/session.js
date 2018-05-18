/* @flow */
import type { PermissionEntry } from "kinto-http";
import type {
  ActionType,
  BucketEntry,
  CollectionEntry,
  GetStateFn,
  SagaGen,
} from "../types";

import { push as updatePath } from "react-router-redux";
import { call, put } from "redux-saga/effects";

import { saveSession, clearSession } from "../store/localStore";
import * as notificationActions from "../actions/notifications";
import * as actions from "../actions/session";
import * as historyActions from "../actions/history";
import { DEFAULT_SERVERINFO } from "../reducers/session";
import { clone } from "../utils";
import { getClient, setupClient, resetClient } from "../client";

export function* serverChange(): SagaGen {
  yield put(actions.serverInfoSuccess(DEFAULT_SERVERINFO));
  yield put(notificationActions.clearNotifications({ force: true }));
}

export function* getServerInfo(
  getState: GetStateFn,
  action: ActionType<typeof actions.getServerInfo>
): SagaGen {
  const { auth }: Object = action;

  let processedAuth = auth;
  if (auth.authType.startsWith("openid-")) {
    processedAuth = {
      ...auth,
      authType: "openid",
      provider: auth.authType.replace("openid-", ""),
    };
  }
  // Set the client globally to the entire app, when the saga starts.
  // We'll compare the remote of this singleton when the server info will be received
  // to prevent race conditions.
  const client = setupClient(processedAuth);
  console.log("getting server info", auth);

  try {
    // Fetch server information
    const serverInfo = yield call([client, client.fetchServerInfo]);

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

    yield put(notificationActions.clearNotifications({ force: true }));
  } catch (error) {
    // As above, we want to ignore this result, if another request was sent in the mean time.
    const currentClient = getClient();
    if (client.remote != currentClient.remote) {
      return;
    }

    // Reset the server info that we might have added previously to the state.
    yield put(actions.serverInfoSuccess(DEFAULT_SERVERINFO));
    yield put(notificationActions.notifyError("Could not reach server", error));
  }
}

export function* setupSession(
  getState: GetStateFn,
  action: ActionType<typeof actions.setup>
): SagaGen {
  const { auth } = action;
  try {
    // Fetch server information
    yield call(getServerInfo, getState, actions.getServerInfo(auth));

    // Check that current user was authenticated as expected.
    // Distinguish anonymous from failed authentication using the user info
    // in the server info endpoint.
    const {
      session: { serverInfo },
    } = getState();
    const { user: { id: userId } = {} } = serverInfo;
    const { authType } = auth;
    if (
      authType != "anonymous" &&
      (!userId ||
        (!userId.startsWith(authType + ":") &&
          // If the authType is openid, the userId doesn't start with "openid:" but "auth0:".
          (authType.startsWith("openid-") && !userId.startsWith("auth0:"))))
    ) {
      yield put(
        notificationActions.notifyError("Authentication failed.", {
          message: `authType is ${authType} and userID is ${userId}`,
        })
      );
      return;
    }

    // We got a valid response; officially declare current user authenticated
    yield put(actions.setAuthenticated());
    // Store this valid server url in the history
    yield put(historyActions.addHistory(serverInfo.url));

    yield put(actions.listBuckets());
    yield put(actions.setupComplete(auth));
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
  yield put(updatePath("/"));
  yield put(
    notificationActions.notifySuccess("Logged out.", { persistent: true })
  );
  yield call(clearSession);
}

export function expandBucketsCollections(
  buckets: BucketEntry[],
  permissions: PermissionEntry[]
): BucketEntry[] {
  // Create a copy to avoid mutating the source object
  const bucketsCopy = clone(buckets);

  // Augment the list of bucket and collections with the ones retrieved from
  // the /permissions endpoint
  for (const permission of permissions) {
    // Add any missing bucket to the current list
    let bucket = bucketsCopy.find(b => b.id === permission.bucket_id);
    if (!bucket) {
      bucket = {
        id: permission.bucket_id,
        collections: [],
        permissions: [],
        readonly: true,
      };
      bucketsCopy.push(bucket);
    }
    // We're dealing with bucket permissions
    if (permission.resource_name === "bucket") {
      bucket.permissions = permission.permissions;
      bucket.readonly = !bucket.permissions.some(bp => {
        return ["write", "collection:create"].includes(bp);
      });
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
      // If this collection is writable, mark its parent bucket writable
      if (!collection.readonly) {
        bucket.readonly = false;
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
        serverInfo: { capabilities: serverCapabilities },
      },
    } = getState();
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
    const responses = yield call([client, client.batch], batch => {
      for (const { id } of data) {
        batch.bucket(id).listCollections();
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
      };
    });

    // If the Kinto API version allows it, retrieves all permissions
    if ("permissions_endpoint" in serverCapabilities) {
      const { data: permissions } = yield call(
        [client, client.listPermissions],
        { pages: Infinity }
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
