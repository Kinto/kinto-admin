import { take, fork, put } from "redux-saga/effects";

import { SESSION_SETUP_COMPLETE, ROUTE_LOAD_REQUEST } from "../constants";
import { getClient } from "../client";
import { resetBucket, bucketLoadSuccess } from "../actions/bucket";
import { resetCollection, collectionLoadSuccess } from "../actions/collection";
import { resetRecord, recordLoadSuccess } from "../actions/record";
import { notifyError } from "../actions/notifications";


export function* loadRoute(bid, cid, rid) {
  try {
    // yield put(resetBucket());
    // yield put(resetCollection());
    // yield put(resetRecord());
    const res = yield getClient().batch(batch => {
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
    });
    const [bucket, collection, record] = res.map(({status, body}) => {
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
  }
}

export function* watchLoadRoute() {
  yield take(SESSION_SETUP_COMPLETE);
  while(true) { // eslint-disable-line
    const {bid, cid, rid} = yield take(ROUTE_LOAD_REQUEST);
    yield fork(loadRoute, bid, cid, rid);
  }
}
