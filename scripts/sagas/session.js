import { push as updatePath } from "react-router-redux";
import { call, put } from "redux-saga/effects";

import * as notificationActions from "../actions/notifications";
import * as sessionActions from "../actions/session";
import * as historyActions from "../actions/history";
import { checkVersion } from "../utils";
import { getClient, setupClient, resetClient, requestPermissions } from "../client";


export function* setupSession(getState, action) {
  const {session} = action;
  try {
    setupClient(session);
    yield put(notificationActions.clearNotifications({force: true}));
    yield put(sessionActions.sessionBusy(true));
    yield call(listBuckets);
    yield put(sessionActions.setupComplete(session));
  } catch(error) {
    yield put(notificationActions.notifyError(error));
  } finally {
    yield put(sessionActions.sessionBusy(false));
  }
}

export function* completeSessionSetup(getState, action) {
  const {session} = action;
  if (session.redirectURL) {
    yield put(updatePath(session.redirectURL));
    yield put(sessionActions.storeRedirectURL(null));
  }
  yield put(historyActions.addHistory(session.server));
}

export function* sessionLogout(getState, action) {
  resetClient();
  yield put(updatePath("/"));
  yield put(notificationActions.notifySuccess("Logged out.", {persistent: true}));
}

export function* listBuckets(getState, action) {
  try {
    const client = getClient();
    // Fetch server information
    const serverInfo = yield call([client, client.fetchServerInfo]);
    // Notify they're received
    yield put(sessionActions.serverInfoSuccess(serverInfo));
    // Retrieve and build the list of buckets
    const {data} = yield call([client, client.listBuckets]);
    const responses = yield call([client, client.batch], (batch) => {
      for (const {id} of data) {
        batch.bucket(id).listCollections();
        // XXX future: query the /permissions endpoint to retrieve the other
        // collections we may have access to because they're shared with us
      }
    });
    const buckets = data.map((bucket, index) => {
      const collections = responses[index].body.data;
      return {id: bucket.id, collections};
    });

    // If the Kinto API version allows it, retrieves all permissions
    if (checkVersion(serverInfo.http_api_version, "1.8", "2.0")) {
      const permissions = yield call(requestPermissions);

      // Augment the list of bucket and collections with the ones retrieved from
      // the /permissions endpoint
      for (const permission of permissions.data) {
        // Add any missing bucket to the current list
        let bucket = buckets.find(x => x.id === permission.bucket_id);
        if (!bucket) {
          bucket = {id: permission.bucket_id, collections: []};
          buckets.push(bucket);
        }
        // Add any missing collection to the current bucket collections list; note
        // that this will expose collections we have shared records within too.
        if ("collection_id" in permission) {
          const collection = bucket.collections.find(x => x.id === permission.collection_id);
          if (!collection) {
            bucket.collections.push({id: permission.collection_id});
          }
        }
      }
    }

    yield put(sessionActions.bucketsSuccess(buckets));
  } catch(error) {
    yield put(notificationActions.notifyError(error));
  }
}
