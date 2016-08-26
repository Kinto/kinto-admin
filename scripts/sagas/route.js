import { call, put } from "redux-saga/effects";
import { push as updatePath } from "react-router-redux";

import { getClient } from "../client";
import { storeRedirectURL } from "../actions/session";
import { resetBucket, bucketBusy, bucketLoadSuccess } from "../actions/bucket";
import { routeLoadSuccess } from "../actions/route";
import { resetCollection, collectionBusy, collectionLoadSuccess } from "../actions/collection";
import { resetGroup, groupBusy, groupLoadSuccess } from "../actions/group";
import { resetRecord } from "../actions/record";
import { recordLoadSuccess } from "../actions/record";
import { notifyInfo, notifyError, clearNotifications } from "../actions/notifications";


function getBatchLoadFn(bid, cid, gid, rid) {
  return (batch) => {
    if (bid) {
      const bucket = batch.bucket(bid);
      bucket.getData();
      if (gid) {
        bucket.getGroup(gid);
      }
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

export function* loadRoute(bid, cid, gid, rid) {
  // If we don't have anything to load, exit
  if (!bid && !cid && !gid && !rid) {
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

    if (gid) {
      yield put(resetGroup());
      yield put(groupBusy(true));
    }

    if (rid) {
      // XXX implement recordBusy()
      yield put(resetRecord());
    }

    // Fetch all currently selected resource data in a single batch request
    const res = yield call([client, client.batch], getBatchLoadFn(bid, cid, gid, rid));
    const responses = res.map(({status, body}, index) => {
      if (status === 403) {
        // We may not have permission to read this resource, though we need to
        // have its default information propagated to the store.
        let id;
        switch(index) {
          case 0: id = bid; break;
          case 1: id = cid ? cid : gid; break;
          case 2: id = rid; break;
        }
        return {data: {id}, permissions: {read: [], write: []}};
      }
      return body;
    });
    // Map them to state
    const bucket     = bid ?               responses[0] : null;
    const collection = bid && cid ?        responses[1] : null;
    const group      = bid && gid ?        responses[1] : null;
    const record     = bid && cid && rid ? responses[2] : null;

    yield put(bucketLoadSuccess(bucket.data, bucket.permissions));
    if (collection) {
      yield put(collectionLoadSuccess({
        ...collection.data,
        bucket: bucket.data.id
      }, collection.permissions));
      if (record) {
        yield put(recordLoadSuccess(record.data, record.permissions));
      }
    }
    if (group) {
      yield put(groupLoadSuccess(group.data, group.permissions));
    }
    yield put(routeLoadSuccess(bucket, collection, rid));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(bucketBusy(false));
    yield put(collectionBusy(false));
  }
}

export function* routeUpdated(getState, action) {
  const {session} = getState();
  const {params, location} = action;
  const {bid, cid, rid, gid, token} = params;

  // Clear notifications on each route update
  yield put(clearNotifications());

  // Check for an authenticated session; if we're requesting anything other
  // than the homepage, redirect to the homepage with a notification.
  if (!session.authenticated && !token && location.pathname !== "/") {
    yield put(storeRedirectURL(location.pathname));
    yield put(updatePath(""));
    yield put(notifyInfo("Authentication required.", {persistent: true}));
    return;
  }

  // Load route related resources
  yield call(loadRoute, bid, cid, gid, rid);

  // Side effect: scroll to page top on each route change
  yield call([window, window.scrollTo], 0, 0);
}
