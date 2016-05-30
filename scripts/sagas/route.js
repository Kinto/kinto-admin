import { call, take, fork, put } from "redux-saga/effects";

import { SESSION_SETUP_COMPLETE, ROUTE_LOAD_REQUEST } from "../constants";
import { getClient } from "../client";
import { resetBucket, bucketBusy, bucketLoadSuccess } from "../actions/bucket";
import { resetCollection, collectionBusy, collectionLoadSuccess } from "../actions/collection";
import { resetRecord, recordLoadSuccess } from "../actions/record";
import { notifyError } from "../actions/notifications";


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

    // Reset all currently selected resources
    yield put(resetBucket());
    yield put(resetCollection());
    yield put(resetRecord());

    // Mark bucket and collection as busy if we are loading them
    if (bid) {
      yield put(bucketBusy(true));
    }

    if (cid) {
      yield put(collectionBusy(true));
    }
    // Fetch all currently selected resource data in a single batch request
    const res = yield call([client, client.batch], getBatchLoadFn(bid, cid, rid));

    // Map them to state
    const [bucket, collection, record] = res.map(({body}) => {
      return body.data;
    });
    if (bucket) {
      yield put(bucketLoadSuccess(bid, bucket));
    }
    if (collection) {
      yield put(collectionLoadSuccess(collection));
    }
    if (record) {
      yield put(recordLoadSuccess(record));
    }
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(bucketBusy(false));
    yield put(collectionBusy(false));
  }
}

export function* watchLoadRoute() {
  // Ensures the session setup is already completed
  yield take(SESSION_SETUP_COMPLETE);

  while(true) { // eslint-disable-line
    const {bid, cid, rid} = yield take(ROUTE_LOAD_REQUEST);
    yield fork(loadRoute, bid, cid, rid);
  }
}
