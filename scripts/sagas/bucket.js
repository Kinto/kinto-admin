import { updatePath } from "redux-simple-router";
import { call, take, fork, put } from "redux-saga/effects";

import {
  COLLECTION_CREATE
} from "../constants";
import { getClient } from "./client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { listBuckets } from "./session";


function getBucket(bid) {
  return getClient().bucket(bid);
}

export function* createCollection(bid, collectionData) {
  const {name, schema, uiSchema, displayFields} = collectionData;
  const bucket = getBucket(bid);
  try {
    yield call([bucket, bucket.createCollection], name, {
      data: {uiSchema, schema, displayFields},
    });
    yield put(updatePath(`/buckets/${bid}/collections/${name}`));
    yield put(notifySuccess("Collection created."));
  } catch(error) {
    yield put(notifyError(error));
  }
  // Reload the list of buckets
  yield listBuckets();
}

export function* watchCollectionCreate() {
  while(true) {
    const {bid, collectionData} = yield take(COLLECTION_CREATE);
    yield fork(createCollection, bid, collectionData);
  }
}
