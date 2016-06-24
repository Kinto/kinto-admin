import { push as updatePath } from "react-router-redux";
import { call, take, fork, put } from "redux-saga/effects";

import {
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_BUCKETS_REQUEST,
  SESSION_LOGOUT,
} from "../constants";
import * as notificationActions from "../actions/notifications";
import * as sessionActions from "../actions/session";
import { getClient, setupClient, resetClient } from "../client";


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

export function* handleSessionRedirect(getState, action) {
  const {session} = action;
  const {redirectURL} = session;
  if (redirectURL) {
    yield put(updatePath(redirectURL));
    yield put(sessionActions.storeRedirectURL(null));
  }
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
      }
    });
    const buckets = data.map((bucket, index) => {
      const collections = responses[index].body.data;
      return {id: bucket.id, collections};
    });
    yield put(sessionActions.bucketsSuccess(buckets));
  } catch(error) {
    yield put(notificationActions.notifyError(error));
  }
}
