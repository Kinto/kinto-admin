import { updatePath } from "redux-simple-router";
import { call, take, fork, put } from "redux-saga/effects";

import {
  COLLECTION_CREATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
  COLLECTION_LOAD_REQUEST,
  COLLECTION_UPDATE_REQUEST,
} from "../constants";
import { getClient } from "./client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { collectionLoadSuccess } from "../actions/collection";
import { listBuckets } from "./session";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* loadCollection(bid, cid) {
  const coll = getCollection(bid, cid);
  try {
    const {data} = yield call([coll, coll.getAttributes]);
    yield put(collectionLoadSuccess({
      ...data,
      bucket: bid,
      label: `${bid}/${data.id}`,
    }));
  } catch(error) {
    yield put(notifyError(error));
  }
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

export function* updateCollection(bid, cid, collectionData) {
  try {
    const coll = getCollection(bid, cid);
    const {data} = yield call([coll, coll.setMetadata], collectionData);
    yield put(collectionLoadSuccess({
      ...data,
      bucket: bid,
      label: `${bid}/${data.id}`,
    }));
    yield put(notifySuccess("Collection properties updated."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* deleteCollection(bid, cid) {
  const bucket = getBucket(bid);
  try {
    yield call([bucket, bucket.deleteCollection], cid);
    yield put(updatePath(""));
    yield put(notifySuccess("Collection deleted."));
  } catch(error) {
    yield put(notifyError(error));
  }
  // Reload the list of buckets
  yield listBuckets();
}

// Watchers

export function* watchCollectionLoad() {
  while(true) {
    const {bid, cid} = yield take(COLLECTION_LOAD_REQUEST);
    yield fork(loadCollection, bid, cid);
  }
}

export function* watchCollectionCreate() {
  while(true) {
    const {bid, collectionData} = yield take(COLLECTION_CREATE_REQUEST);
    yield fork(createCollection, bid, collectionData);
  }
}

export function* watchCollectionUpdate() {
  while(true) {
    const {bid, cid, collectionData} = yield take(COLLECTION_UPDATE_REQUEST);
    yield fork(updateCollection, bid, cid, collectionData);
  }
}

export function* watchCollectionDelete() {
  while(true) {
    const {bid, cid} = yield take(COLLECTION_DELETE_REQUEST);
    yield fork(deleteCollection, bid, cid);
  }
}
