import { updatePath } from "redux-simple-router";
import { call, take, fork, put } from "redux-saga/effects";

import {
  SESSION_SETUP,
  SESSION_BUCKETS_REQUEST,
  SESSION_LOGOUT
} from "../constants";
import * as notificationActions from "../actions/notifications";
import * as sessionActions from "../actions/session";
import { getClient, setupClient, resetClient } from "../client";


export function* setupSession(session) {
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

export function* sessionLogout() {
  resetClient();
  yield put(updatePath("/"));
  yield put(notificationActions.notifySuccess("Logged out.", {persistent: true}));
}

export function* listBuckets(serverInfo) {
  const client = getClient();
  try {
    // Fetch server information
    const serverInfo = yield call([client, client.fetchServerInfo]);
    // Notify they're received
    yield put(sessionActions.serverInfoSuccess(serverInfo));
    // If we have default bucket information
    if (serverInfo.user && serverInfo.user.bucket) {
      // XXX We need to first issue a request to the "default" bucket in order
      // to create user associated permissions, so we can access the list of
      // buckets.
      // ref https://github.com/Kinto/kinto/issues/454
      const buck = client.bucket("default");
      yield call([buck, buck.getAttributes]);
    }
    // Retrieve and build the list of buckets
    let buckets = [];
    const {data} = yield call([client, client.listBuckets]);
    for (const {id} of data) {
      const bucket = client.bucket(id);
      const {data} = yield call([bucket, bucket.listCollections], id);
      buckets.push({id, collections: data});
    }
    yield put(sessionActions.bucketsSuccess(buckets));
  } catch(error) {
    yield put(notificationActions.notifyError(error));
  }
}

// Watchers

export function* watchSessionSetup() {
  while(true) { // eslint-disable-line
    const {session} = yield take(SESSION_SETUP);
    yield fork(setupSession, session);
  }
}

export function* watchSessionBuckets() {
  while(yield take(SESSION_BUCKETS_REQUEST)) {
    yield fork(listBuckets);
  }
}

export function* watchSessionLogout() {
  while(yield take(SESSION_LOGOUT)) {
    yield fork(sessionLogout);
  }
}
