import { push as updatePath } from "react-router-redux";
import { takeEvery } from "redux-saga";
import { call, take, fork, put } from "redux-saga/effects";

import {
  BUCKET_CREATE_REQUEST,
  BUCKET_UPDATE_REQUEST,
  BUCKET_DELETE_REQUEST,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
} from "../constants";
import { getClient } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { sessionBusy } from "../actions/session";
import { bucketLoadSuccess } from "../actions/bucket";
import { collectionLoadSuccess } from "../actions/collection";
import { listBuckets } from "./session";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* createBucket(getState, action) {
  const {bid, data} = action;
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.createBucket], bid, {data});
    yield call(listBuckets);
    yield put(updatePath(`/buckets/${bid}/edit`));
    yield put(notifySuccess("Bucket created."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* updateBucket(bid, bucketData) {
  try {
    const bucket = getBucket(bid);
    yield put(sessionBusy(true));
    const {data, permissions} = yield call([bucket, bucket.setData], bucketData);
    yield put(bucketLoadSuccess(data, permissions));
    yield put(notifySuccess("Bucket updated."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* deleteBucket(bid) {
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.deleteBucket], bid);
    yield call(listBuckets);
    yield put(updatePath("/"));
    yield put(notifySuccess("Bucket deleted."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* createCollection(bid, collectionData) {
  try {
    const {
      name,
      schema,
      uiSchema,
      attachment,
      sort,
      displayFields,
    } = collectionData;
    const bucket = getBucket(bid);
    yield call([bucket, bucket.createCollection], name, {
      data: {uiSchema, schema, attachment, sort, displayFields},
    });
    yield put(updatePath(`/buckets/${bid}/collections/${name}`));
    yield put(notifySuccess("Collection created."));
    yield call(listBuckets);
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* updateCollection(bid, cid, collectionData) {
  try {
    const coll = getCollection(bid, cid);
    const {data, permissions} = yield call([coll, coll.setData], collectionData);
    yield put(collectionLoadSuccess({...data, bucket: bid}, permissions));
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Collection properties updated."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* deleteCollection(bid, cid) {
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteCollection], cid);
    yield put(updatePath(""));
    yield put(notifySuccess("Collection deleted."));
    yield call(listBuckets);
  } catch(error) {
    yield put(notifyError(error));
  }
}

// Watchers

export function* watchBucketCreate(getState) {
  yield* takeEvery(BUCKET_CREATE_REQUEST, createBucket, getState);
}

export function* watchBucketUpdate() {
  while(true) { // eslint-disable-line
    const {bid, bucketData} = yield take(BUCKET_UPDATE_REQUEST);
    yield fork(updateBucket, bid, bucketData);
  }
}

export function* watchBucketDelete() {
  while(true) { // eslint-disable-line
    const {bid} = yield take(BUCKET_DELETE_REQUEST);
    yield fork(deleteBucket, bid);
  }
}

export function* watchCollectionCreate() {
  while(true) { // eslint-disable-line
    const {bid, collectionData} = yield take(COLLECTION_CREATE_REQUEST);
    yield fork(createCollection, bid, collectionData);
  }
}

export function* watchCollectionUpdate() {
  while(true) { // eslint-disable-line
    const {bid, cid, collectionData} = yield take(COLLECTION_UPDATE_REQUEST);
    yield fork(updateCollection, bid, cid, collectionData);
  }
}

export function* watchCollectionDelete() {
  while(true) { // eslint-disable-line
    const {bid, cid} = yield take(COLLECTION_DELETE_REQUEST);
    yield fork(deleteCollection, bid, cid);
  }
}
