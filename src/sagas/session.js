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
import { clone } from "../utils";
import { getClient, setupClient, resetClient } from "../client";

export function* setupSession(
  getState: GetStateFn,
  action: ActionType<typeof actions.setup>
): SagaGen {
  const { auth } = action;
  try {
    setupClient(auth);
    yield put(notificationActions.clearNotifications({ force: true }));
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
    // retrieve sidebarMaxListedCollections setting
    const client = getClient();
    // Fetch server information
    const serverInfo = yield call([client, client.fetchServerInfo]);
    // We got a valid response; officially declare current user authenticated
    // XXX: authenticated here means that we have setup the client, not
    // that the credentials are valid :/
    yield put(actions.setAuthenticated());
    // Store this valid server url in the history
    yield put(historyActions.addHistory(serverInfo.url));
    // Notify they're received
    yield put(actions.serverInfoSuccess(serverInfo));
    // Retrieve and build the list of buckets
    let data;
    try {
      data = (yield call([client, client.listBuckets])).data;
    } catch (error) {
      // If the user is not allowed to list the buckets, we want
      // to show an empty list.
      if (!/HTTP 403/.test(error.message)) {
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
    if ("permissions_endpoint" in serverInfo.capabilities) {
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
