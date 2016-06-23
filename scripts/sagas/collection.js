import { push as updatePath } from "react-router-redux";
import { takeEvery } from "redux-saga";
import { call, take, fork, put } from "redux-saga/effects";
import { v4 as uuid } from "uuid";
import { createFormData } from "../utils";

import {
  ATTACHMENT_DELETE_REQUEST,
  SESSION_SERVERINFO_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../constants";
import { getClient, requestAttachment } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { resetRecord } from "../actions/record";
import * as actions from "../actions/collection";


function shouldProcessAttachment(serverInfo, records) {
  const {capabilities={}} = serverInfo;
  records = Array.isArray(records) ? records : [records];
  const hasAttachment = records.some(r => !!r.__attachment__);
  return capabilities.hasOwnProperty("attachments") && hasAttachment;
}

function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* deleteAttachment(action) {
  const {bid, cid, rid} = action;
  try {
    yield put(actions.collectionBusy(true));
    yield call(requestAttachment, bid, cid, rid, {method: "delete"});
    yield put(updatePath(`/buckets/${bid}/collections/${cid}/edit/${rid}`));
    yield put(notifySuccess("Attachment deleted."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* listRecords(action) {
  const {bid, cid, sort} = action;
  try {
    const coll = getCollection(bid, cid);
    const {data} = yield call([coll, coll.listRecords], {sort});
    yield put(actions.listRecordsSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* createRecordWithAttachment(bid, cid, record) {
  try {
    yield put(actions.collectionBusy(true));
    const rid = yield call(uuid);
    const formData = yield call(createFormData, record);
    yield call(requestAttachment, bid, cid, rid, {
      method: "post",
      body: formData
    });
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* createRecord(bid, cid, record) {
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    yield call([coll, coll.createRecord], record);
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* updateRecord(getState, action) {
  const {session} = getState();
  const {bid, cid, rid, record} = action;
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    if (shouldProcessAttachment(session.serverInfo, record)) {
      const formData = yield call(createFormData, record);
      yield call(requestAttachment, bid, cid, rid, {
        method: "post",
        body: formData
      });
    } else {
      // Note: We update using PATCH to keep existing record properties possibly
      // not defined by the JSON schema, if any.
      yield call([coll, coll.updateRecord], {...record, id: rid}, {patch: true});
    }
    yield put(resetRecord());
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record updated."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* deleteRecord(action) {
  const {bid, cid, rid} = action;
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    yield call([coll, coll.deleteRecord], rid);
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Record deleted."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* bulkCreateRecords(bid, cid, records) {
  let errorDetails = [];
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    const {errors, published} = yield call([coll, coll.batch], (batch) => {
      for (const record of records) {
        batch.createRecord(record);
      }
    }, {aggregate: true});
    if (errors.length > 0) {
      errorDetails = errors.map(err => err.error.message);
      throw new Error("Some records could not be created.");
    }
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess(`${published.length} records created.`));
  } catch(error) {
    yield put(notifyError(error, {details: errorDetails}));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* bulkCreateRecordsWithAttachment(bid, cid, records) {
  try {
    yield put(actions.collectionBusy(true));
    // XXX We should perform a batch request here
    for (const record of records) {
      const rid = yield call(uuid);
      const formData = yield call(createFormData, record);
      yield call(requestAttachment, bid, cid, rid, {
        method: "post",
        body: formData
      });
    }
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess(`${records.length} records created.`));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

// Watchers

export function* watchListRecords() {
  yield* takeEvery(COLLECTION_RECORDS_REQUEST, listRecords);
}

export function* watchRecordCreate(serverInfoAction) {
  // Note: serverInfoAction is provided by takeLatest in the rootSaga
  const {serverInfo} = serverInfoAction;
  while(true) { // eslint-disable-line
    const {bid, cid, record} = yield take(RECORD_CREATE_REQUEST);
    // Check if we have to deal with attachments
    if (shouldProcessAttachment(serverInfo, record)) {
      yield fork(createRecordWithAttachment, bid, cid, record);
    } else {
      yield fork(createRecord, bid, cid, record);
    }
  }
}

export function* watchRecordUpdate(getState) {
  yield* takeEvery(RECORD_UPDATE_REQUEST, updateRecord, getState);
}

export function* watchAttachmentDelete() {
  yield* takeEvery(ATTACHMENT_DELETE_REQUEST, deleteAttachment);
}

export function* watchRecordDelete() {
  yield* takeEvery(RECORD_DELETE_REQUEST, deleteRecord);
}

export function* watchBulkCreateRecords() {
  const {serverInfo} = yield take(SESSION_SERVERINFO_SUCCESS);
  while(true) { // eslint-disable-line
    const {bid, cid, records} = yield take(RECORD_BULK_CREATE_REQUEST);
    if (shouldProcessAttachment(serverInfo, records)) {
      yield fork(bulkCreateRecordsWithAttachment, bid, cid, records);
    } else {
      yield fork(bulkCreateRecords, bid, cid, records);
    }
  }
}
