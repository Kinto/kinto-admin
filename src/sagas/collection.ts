import * as actions from "@src/actions/collection";
import { redirectTo } from "@src/actions/route";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import type { ActionType, GetStateFn, SagaGen } from "@src/types";
import { call, put } from "redux-saga/effects";

function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* deleteAttachment(
  getState: GetStateFn,
  action: ActionType<typeof actions.deleteAttachment>
): SagaGen {
  const { bid, cid, rid } = action;
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    yield call([coll, coll.removeAttachment], rid);
    yield put(redirectTo("record:attributes", { bid, cid, rid }));
    notifySuccess("Attachment deleted.");
  } catch (error) {
    yield notifyError("Couldn't delete attachment.", error);
  } finally {
    yield put(actions.collectionBusy(false));
  }
}

export function* listHistory(
  getState: GetStateFn,
  action: ActionType<typeof actions.listCollectionHistory>
): SagaGen {
  const {
    bid,
    cid,
    filters: { resource_name, since, exclude_user_id },
  } = action;
  try {
    const bucket = getBucket(bid);
    const { data, hasNextPage, next } = yield call(
      [bucket, bucket.listHistory],
      {
        limit: MAX_PER_PAGE,
        filters: {
          resource_name,
          collection_id: cid,
          exclude_user_id: exclude_user_id,
          "gt_target.data.last_modified": since,
        },
      }
    );
    yield put(actions.listCollectionHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    notifyError("Couldn't list collection history.", error);
  }
}

export function* listNextHistory(getState: GetStateFn): SagaGen {
  const {
    collection: {
      history: { next: fetchNextHistory },
    },
  } = getState();
  if (fetchNextHistory == null) {
    return;
  }
  try {
    const { data, hasNextPage, next } = yield call(fetchNextHistory);
    yield put(actions.listCollectionHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    notifyError("Couldn't process next page.", error);
  }
}

export function* createRecord(
  getState: GetStateFn,
  action: ActionType<typeof actions.createRecord>
): SagaGen {
  const { session } = getState();
  const { bid, cid, record, attachment } = action;
  try {
    const coll = getCollection(bid, cid);
    if (session.serverInfo.capabilities.attachments != null && attachment) {
      const attachmentOptions = { safe: true };
      yield call(
        [coll, coll.addAttachment],
        attachment,
        record as any,
        attachmentOptions
      );
    } else {
      yield call([coll, coll.createRecord], record, { safe: true });
    }
    yield put(redirectTo("collection:records", { bid, cid }));
    notifySuccess("Record created.");
  } catch (error) {
    yield notifyError("Couldn't create record.", error);
  }
}

export function* updateRecord(
  getState: GetStateFn,
  action: ActionType<typeof actions.updateRecord>
): SagaGen {
  const {
    session,
    record: { data: currentRecord },
  } = getState();
  const {
    bid,
    cid,
    rid,
    record: { data, permissions },
    attachment,
  } = action;
  const { last_modified } = currentRecord;
  try {
    const coll = getCollection(bid, cid);
    if (data) {
      const updatedRecord = { ...data, id: rid, last_modified };
      if (session.serverInfo.capabilities.attachments != null && attachment) {
        const attachmentOptions = { safe: true };
        yield call(
          [coll, coll.addAttachment],
          attachment,
          updatedRecord as any,
          attachmentOptions
        );
      } else {
        yield call([coll, coll.updateRecord], updatedRecord, { safe: true });
      }
      yield put(redirectTo("collection:records", { bid, cid }));
      notifySuccess("Record attributes updated.");
    } else if (permissions) {
      yield call([coll, coll.updateRecord], currentRecord as any, {
        permissions,
        safe: true,
        last_modified,
      });
      yield put(redirectTo("record:permissions", { bid, cid, rid }));
      notifySuccess("Record permissions updated.");
    }
  } catch (error) {
    yield notifyError("Couldn't update record.", error);
  }
}

export function* deleteRecord(
  getState: GetStateFn,
  action: ActionType<typeof actions.deleteRecord>
): SagaGen {
  const { bid, cid, rid, last_modified: actionLastModified } = action;
  const { record: currentRecord = { data: {} as { last_modified?: number } } } =
    getState();
  const { last_modified = actionLastModified } = currentRecord.data;
  try {
    const coll = getCollection(bid, cid);
    yield call([coll, coll.deleteRecord], rid, { safe: true, last_modified });
    yield put(redirectTo("collection:records", { bid, cid }));
    notifySuccess("Record deleted.");
  } catch (error) {
    yield notifyError("Couldn't delete record.", error);
  }
}

export function* bulkCreateRecords(
  getState: GetStateFn,
  action: ActionType<typeof actions.bulkCreateRecords>
): SagaGen {
  const { session } = getState();
  const { bid, cid, records } = action;
  let errorDetails = [];
  try {
    const coll = getCollection(bid, cid);
    yield put(actions.collectionBusy(true));
    if ("attachments" in session.serverInfo.capabilities) {
      // XXX We should perform a batch request here
      for (const rawRecord of records) {
        // Note: data urls are attached to the __attachment__ record property
        const { __attachment__: attachment, ...record } = rawRecord;
        if (attachment) {
          yield call([coll, coll.addAttachment], attachment, record as any);
        } else {
          yield call([coll, coll.createRecord], record as any);
        }
      }
      yield put(redirectTo("collection:records", { bid, cid }));
      notifySuccess(`${records.length} records created.`);
    } else {
      const { errors, published } = yield call(
        [coll, coll.batch],
        batch => {
          for (const record of records) {
            batch.createRecord(record, { safe: true });
          }
        },
        { aggregate: true }
      );
      if (errors.length > 0) {
        errorDetails = errors.map(err => err.error.message);
        throw new Error("Some records could not be created.");
      }
      yield put(redirectTo("collection:records", { bid, cid }));
      notifySuccess(`${published.length} records created.`);
    }
  } catch (error) {
    yield notifyError("Couldn't create some records.", error, {
      details: errorDetails,
    });
  } finally {
    yield put(actions.collectionBusy(false));
  }
}
