import { push as updatePath } from "react-router-redux";
import { call, take, fork, put } from "redux-saga/effects";

import {
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "../constants";
import { getClient } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import * as collectionActions from "../actions/collection";
import { recordLoadSuccess, resetRecord } from "../actions/record";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* listRecords(bid, cid) {
  // Wait for the collection data to be loaded before loading its records
  yield take(ROUTE_LOAD_SUCCESS);
  try {
    const coll = getCollection(bid, cid);
    yield put(collectionActions.collectionBusy(true));
    const {data} = yield call([coll, coll.listRecords]);
    yield put(collectionActions.listRecordsSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionActions.collectionBusy(false));
  }
}

export function* loadRecord(bid, cid, rid) {
  try {
    const coll = getCollection(bid, cid);
    yield put(collectionActions.collectionBusy(true));
    const {data} = yield call([coll, coll.getRecord], rid);
    yield put(recordLoadSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionActions.collectionBusy(false));
  }
}

export function* createRecord(bid, cid, record) {
  try {
    const coll = getCollection(bid, cid);
    yield put(collectionActions.collectionBusy(true));
    yield call([coll, coll.createRecord], record);
    yield put(collectionActions.listRecords(bid, cid));
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionActions.collectionBusy(false));
  }
}

export function* updateRecord(bid, cid, rid, record) {
  try {
    const coll = getCollection(bid, cid);
    yield put(collectionActions.collectionBusy(true));
    yield call([coll, coll.updateRecord], {...record, id: rid});
    yield put(resetRecord());
    yield put(collectionActions.listRecords(bid, cid));
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionActions.collectionBusy(false));
  }
}

export function* deleteRecord(bid, cid, rid) {
  try {
    const coll = getCollection(bid, cid);
    yield put(collectionActions.collectionBusy(true));
    yield call([coll, coll.deleteRecord], rid);
    yield put(collectionActions.listRecords(bid, cid));
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record deleted."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionActions.collectionBusy(false));
  }
}

export function* bulkCreateRecords(bid, cid, records) {
  try {
    const coll = getCollection(bid, cid);
    yield put(collectionActions.collectionBusy(true));
    const {errors, published} = yield call([coll, coll.batch], (batch) => {
      for (const record of records) {
        batch.createRecord(record);
      }
    }, {aggregate: true});
    if (errors.length > 0) {
      const err = new Error("Some records could not be created.");
      err.details = errors.map(err => err.error.message);
      throw err;
    } else {
      yield put(collectionActions.listRecords(bid, cid));
      yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
      yield put(notifySuccess(`${published.length} records created.`));
    }
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionActions.collectionBusy(false));
  }
}

// Watchers

export function* watchCollectionRecords() {
  while(true) { // eslint-disable-line
    const {bid, cid} = yield take(COLLECTION_RECORDS_REQUEST);
    yield fork(listRecords, bid, cid);
  }
}

export function* watchRecordLoad() {
  while(true) { // eslint-disable-line
    const {bid, cid, rid} = yield take(RECORD_LOAD_REQUEST);
    yield fork(loadRecord, bid, cid, rid);
  }
}

export function* watchRecordCreate() {
  while(true) { // eslint-disable-line
    const {bid, cid, record} = yield take(RECORD_CREATE_REQUEST);
    yield fork(createRecord, bid, cid, record);
  }
}

export function* watchRecordUpdate() {
  while(true) { // eslint-disable-line
    const {bid, cid, rid, record} = yield take(RECORD_UPDATE_REQUEST);
    yield fork(updateRecord, bid, cid, rid, record);
  }
}

export function* watchRecordDelete() {
  while(true) { // eslint-disable-line
    const {bid, cid, rid} = yield take(RECORD_DELETE_REQUEST);
    yield fork(deleteRecord, bid, cid, rid);
  }
}

export function* watchBulkCreateRecords() {
  while(true) { // eslint-disable-line
    const {bid, cid, records} = yield take(RECORD_BULK_CREATE_REQUEST);
    yield fork(bulkCreateRecords, bid, cid, records);
  }
}
