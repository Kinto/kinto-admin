import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { recordBusy, resetRecord } from "../actions/record";
import { redirectTo } from "../actions/route";
import * as actions from "../actions/collection";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* deleteAttachment(getState, action) {
  const {bid, cid, rid} = action;
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    yield call([coll, coll.removeAttachment], rid);
    yield put(redirectTo("record:attributes", {bid, cid, rid}));
    yield put(notifySuccess("Attachment deleted."));
  } catch(error) {
    yield put(notifyError("Couldn't delete attachment.", error));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* listRecords(getState, action) {
  const {
    collection: {currentSort, data: {sort: defaultSort}},
    settings: {maxPerPage},
  } = getState();
  const {bid, cid, sort = currentSort} = action;
  try {
    const coll = getCollection(bid, cid);
    const {data, hasNextPage, next} = yield call([coll, coll.listRecords], {
      sort: sort || currentSort || defaultSort,
      limit: maxPerPage,
    });
    yield put(actions.listRecordsSuccess(data, hasNextPage, next));
  } catch(error) {
    yield put(notifyError("Couldn't list records.", error));
  }
}

export function* listNextRecords(getState) {
  const {collection} = getState();
  const {listNextRecords} = collection;
  try {
    const {data, hasNextPage, next} = yield call(listNextRecords);
    yield put(actions.listRecordsSuccess(data, hasNextPage, next));
    yield call([window, window.scrollTo], 0, window.document.body.scrollHeight);
  } catch(error) {
    yield put(notifyError("Couldn't process next page.", error));
  }
}

export function* listHistory(getState, action) {
  const {bid, cid, filters: {since, resource_name}} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listHistory], {
      since,
      filters: {
        resource_name,
        collection_id: cid,
      }
    });
    yield put(actions.listCollectionHistorySuccess(data));
  } catch(error) {
    yield put(notifyError("Couldn't list collection history.", error));
  }
}

export function* createRecord(getState, action) {
  const {session} = getState();
  const {bid, cid, record, attachment} = action;
  try {
    const coll = getCollection(bid, cid);
    if ("attachments" in session.serverInfo.capabilities && attachment) {
      yield call([coll, coll.addAttachment], attachment, record, {
        safe: true,
        last_modified: 1, // #299: creation; oldest acceptable timestamp
      });
    } else {
      yield call([coll, coll.createRecord], record, {safe: true});
    }
    yield put(redirectTo("collection:records", {bid, cid}));
    yield put(notifySuccess("Record added."));
  } catch(error) {
    yield put(notifyError("Couldn't create record.", error));
  } finally {
    yield put(recordBusy(false));
  }
}

export function* updateRecord(getState, action) {
  const {session, record: {data: currentRecord}} = getState();
  const {bid, cid, rid, record: {data, permissions}, attachment} = action;
  const {last_modified} = currentRecord;
  try {
    const coll = getCollection(bid, cid);
    if (data) {
      const updatedRecord = {...data, id: rid, last_modified};
      if ("attachments" in session.serverInfo.capabilities && attachment) {
        yield call([coll, coll.addAttachment], attachment, updatedRecord, {safe: true});
      } else {
        // Note: We update using PATCH to keep existing record attributes possibly
        // not defined by the JSON schema, if any.
        yield call([coll, coll.updateRecord], updatedRecord, {patch: true, safe: true});
      }
      yield put(resetRecord());
      yield put(redirectTo("collection:records", {bid, cid}));
      yield put(notifySuccess("Record attributes updated."));
    } else if (permissions) {
      yield call([coll, coll.updateRecord], currentRecord, {
        permissions,
        safe: true,
        last_modified,
      });
      yield put(redirectTo("record:permissions", {bid, cid, rid}));
      yield put(notifySuccess("Record permissions updated."));
    }
  } catch(error) {
    yield put(notifyError("Couldn't update record.", error));
  } finally {
    yield put(recordBusy(false));
  }
}

export function* deleteRecord(getState, action) {
  const {bid, cid, rid, last_modified: actionLastModified} = action;
  const {record: currentRecord={data: {}}} = getState();
  const {last_modified=actionLastModified} = currentRecord.data;
  try {
    const coll = getCollection(bid, cid);
    yield call([coll, coll.deleteRecord], rid, {safe: true, last_modified});
    yield put(redirectTo("collection:records", {bid, cid}));
    yield put(notifySuccess("Record deleted."));
  } catch(error) {
    yield put(notifyError("Couldn't delete record.", error));
  } finally {
    yield put(recordBusy(false));
  }
}

export function* bulkCreateRecords(getState, action) {
  const {session} = getState();
  const {bid, cid, records} = action;
  let errorDetails = [];
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    if ("attachments" in session.serverInfo.capabilities) {
      // XXX We should perform a batch request here
      for (const rawRecord of records) {
        // Note: data urls are attached to the __attachment__ record property
        const {__attachment__: attachment, ...record} = rawRecord;
        if (attachment) {
          yield call([coll, coll.addAttachment], attachment, record);
        } else {
          yield call([coll, coll.createRecord], record);
        }
      }
      yield put(redirectTo("collection:records", {bid, cid}));
      yield put(notifySuccess(`${records.length} records created.`));
    } else {
      const {errors, published} = yield call([coll, coll.batch], (batch) => {
        for (const record of records) {
          batch.createRecord(record, {safe: true});
        }
      }, {aggregate: true});
      if (errors.length > 0) {
        errorDetails = errors.map(err => err.error.message);
        throw new Error("Some records could not be created.");
      }
      yield put(redirectTo("collection:records", {bid, cid}));
      yield put(notifySuccess(`${published.length} records created.`));
    }
  } catch(error) {
    yield put(notifyError("Couldn't create some records.", error, {details: errorDetails}));
  } finally {
    yield put(actions.collectionBusy(false));
  }
}
