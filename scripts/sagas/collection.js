import { updatePath } from "redux-simple-router";
import { call, take, fork, put } from "redux-saga/effects";

import {
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
} from "../constants";
import { getClient } from "./client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { collectionRecordsSuccess } from "../actions/collection";
import { recordLoadSuccess, resetRecord } from "../actions/record";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* listRecords(bid, cid) {
  const coll = getCollection(bid, cid);
  try {
    const {data} = yield call([coll, coll.listRecords]);
    yield put(collectionRecordsSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* loadRecord(bid, cid, rid) {
  const coll = getCollection(bid, cid);
  // XXX mark collection and record as busy
  try {
    const {data} = yield call([coll, coll.getRecord], rid);
    yield put(recordLoadSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* createRecord(bid, cid, record) {
  const coll = getCollection(bid, cid);
  // XXX mark collection and record as busy
  try {
    yield call([coll, coll.createRecord], record);
    yield listRecords(bid, cid); // XXX put action instead
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* updateRecord(bid, cid, rid, record) {
  const coll = getCollection(bid, cid);
  // XXX mark collection and record as busy
  try {
    yield call([coll, coll.updateRecord], {...record, id: rid});
    yield put(resetRecord());
    yield listRecords(bid, cid); // XXX put action instead
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

// Watchers

export function* watchCollectionRecords() {
  while(true) {
    const {bid, cid} = yield take(COLLECTION_RECORDS_REQUEST);
    yield fork(listRecords, bid, cid);
  }
}

export function* watchRecordLoad() {
  while(true) {
    const {bid, cid, rid} = yield take(RECORD_LOAD_REQUEST);
    yield fork(loadRecord, bid, cid, rid);
  }
}

export function* watchRecordCreate() {
  while(true) {
    const {bid, cid, record} = yield take(RECORD_CREATE_REQUEST);
    yield fork(createRecord, bid, cid, record);
  }
}

export function* watchRecordUpdate() {
  while(true) {
    const {bid, cid, rid, record} = yield take(RECORD_UPDATE_REQUEST);
    yield fork(updateRecord, bid, cid, rid, record);
  }
}
