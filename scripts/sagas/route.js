import { call, take, put } from "redux-saga/effects";
import { push as updatePath } from "react-router-redux";

import { ROUTE_UPDATED } from "../constants";
import { getClient } from "../client";
import { storeRedirectURL } from "../actions/session";
import { resetBucket, bucketBusy, bucketLoadSuccess } from "../actions/bucket";
import { routeLoadSuccess } from "../actions/route";
import { resetCollection, collectionBusy, collectionLoadSuccess } from "../actions/collection";
import { resetRecord } from "../actions/record";
import { recordLoadSuccess } from "../actions/record";
import { notifyInfo, notifyError, clearNotifications } from "../actions/notifications";


function getBatchLoadFn(bid, cid, rid) {
  return (batch) => {
    if (bid) {
      const bucket = batch.bucket(bid);
      bucket.getData();
      if (cid) {
        const coll = bucket.collection(cid);
        coll.getData();
        if (rid) {
          coll.getRecord(rid);
        }
      }
    }
  };
}

export function* loadRoute(bid, cid, rid) {
  // If we don't have anything to load, exit
  if (!bid && !cid && !rid) {
    return;
  }

  try {
    const client = getClient();

    // Mark bucket and collection as busy if we are loading them
    yield put(resetBucket(bid));
    yield put(bucketBusy(true));

    if (cid) {
      yield put(resetCollection());
      yield put(collectionBusy(true));
    }

    if (rid) {
      yield put(resetRecord());
    }

    // Fetch all currently selected resource data in a single batch request
    const res = yield call([client, client.batch], getBatchLoadFn(bid, cid, rid));

    // Map them to state
    const [bucket, collection, record] = res.map(({status, body}, index) => {
      if (status === 403) {
        // We may not have permission to read this resource, though we need to
        // have its default information propagated to the store.
        if (index === 0) { // bucket
          return {data: {id: bid}};
        }
        if (index === 1) { // collection
          return {data: {id: cid}};
        }
      }
      return body;
    });
    yield put(bucketLoadSuccess(bid, bucket.data, bucket.permissions));
    if (collection) {
      yield put(collectionLoadSuccess({
        ...collection.data,
        bucket: bucket.data.id
      }, collection.permissions));
      if (record) {
        yield put(recordLoadSuccess(record.data, record.permissions));
      }
    }
    yield put(routeLoadSuccess(bucket, collection, rid));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(bucketBusy(false));
    yield put(collectionBusy(false));
  }
}

export function* routeUpdated(authenticated, params={}, location) {
  const {bid, cid, rid, token} = params;

  // Clear notifications on each route update
  yield put(clearNotifications());

  // Check for an authenticated session; if we're requesting anything other
  // than the homepage, redirect to the homepage with a notification.
  if (!authenticated && !token && location.pathname !== "/") {
    yield put(storeRedirectURL(location.pathname));
    yield put(updatePath(""));
    yield put(notifyInfo("Authentication required.", {persistent: true}));
    return;
  }

  // Load route related resources
  yield call(loadRoute, bid, cid, rid);

  // Side effect: scroll to page top on each route change
  yield call([window, window.scrollTo], 0, 0);
}

// Watchers

export function* watchRouteUpdated() {
  while(true) { // eslint-disable-line
    const {authenticated, params, location} = yield take(ROUTE_UPDATED);
    yield call(routeUpdated, authenticated, params, location);
  }
}
