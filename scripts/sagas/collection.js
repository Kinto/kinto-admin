import { updatePath } from "redux-simple-router";
import { call, take, fork, put } from "redux-saga/effects";

import {
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../constants";
import { getClient } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { collectionBusy, listRecordsSuccess } from "../actions/collection";
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
    yield put(collectionBusy(true));
    const {data} = yield call([coll, coll.listRecords]);
    yield put(listRecordsSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(collectionBusy(false));
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

export function* deleteRecord(bid, cid, rid) {
  const coll = getCollection(bid, cid);
  // XXX mark collection and record as busy
  try {
    yield call([coll, coll.deleteRecord], rid);
    yield listRecords(bid, cid); // XXX put action instead
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record deleted."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* bulkCreateRecords(bid, cid, records) {
  const coll = getCollection(bid, cid);
  // XXX mark collection and record as busy
  try {
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
      yield listRecords(bid, cid); // XXX dispatch action instead
      yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
      yield put(notifySuccess(`${published.length} records created.`));
    }
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

export function* watchRecordDelete() {
  while(true) {
    const {bid, cid, rid} = yield take(RECORD_DELETE_REQUEST);
    yield fork(deleteRecord, bid, cid, rid);
  }
}

export function* watchBulkCreateRecords() {
  while(true) {
    const {bid, cid, records} = yield take(RECORD_BULK_CREATE_REQUEST);
    yield fork(bulkCreateRecords, bid, cid, records);
  }
}
