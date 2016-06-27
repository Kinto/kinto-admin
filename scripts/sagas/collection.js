import { push as updatePath } from "react-router-redux";
import { call, put } from "redux-saga/effects";
import { v4 as uuid } from "uuid";
import { createFormData } from "../utils";

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

export function* deleteAttachment(getState, action) {
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

export function* listRecords(getState, action) {
  const {collection} = getState();
  const defaultSort = collection.sort;
  const {bid, cid, sort} = action;
  try {
    const coll = getCollection(bid, cid);
    const {data} = yield call([coll, coll.listRecords], {
      sort: sort || defaultSort
    });
    yield put(actions.listRecordsSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* createRecord(getState, action) {
  const {session} = getState();
  const {bid, cid, record} = action;
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    if (shouldProcessAttachment(session.serverInfo, record)) {
      const rid = yield call(uuid);
      const formData = yield call(createFormData, record);
      yield call(requestAttachment, bid, cid, rid, {
        method: "post",
        body: formData
      });
    } else {
      yield call([coll, coll.createRecord], record);
    }
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

export function* deleteRecord(getState, action) {
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

export function* bulkCreateRecords(getState, action) {
  const {session} = getState();
  const {bid, cid, records} = action;
  let errorDetails = [];
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    if (shouldProcessAttachment(session.serverInfo, records)) {
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
    } else {
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
    }
  } catch(error) {
    yield put(notifyError(error, {details: errorDetails}));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}
