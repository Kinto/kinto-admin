import * as actions from "@src/actions/collection";
import { recordBusy, resetRecord } from "@src/actions/record";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import type { ActionType, GetStateFn, SagaGen } from "@src/types";
import { redirect } from "react-router";
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
    // yield put(redirectTo("record:attributes", { bid, cid, rid }));
    notifySuccess("Attachment deleted.");
  } catch (error) {
    yield notifyError("Couldn't delete attachment.", error);
  } finally {
    yield put(actions.collectionBusy(false));
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
    // yield put(redirectTo("collection:records", { bid, cid }));
    notifySuccess("Record deleted.");
  } catch (error) {
    yield notifyError("Couldn't delete record.", error);
  } finally {
    yield put(recordBusy(false));
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
      // yield put(redirectTo("collection:records", { bid, cid }));
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
      // yield put(redirectTo("collection:records", { bid, cid }));
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
