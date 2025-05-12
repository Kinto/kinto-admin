import * as actions from "@src/actions/bucket";
import { listBuckets } from "@src/actions/session";
import { getClient } from "@src/client";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import type { ActionType, GetStateFn, SagaGen } from "@src/types";
import { call, put } from "redux-saga/effects";

function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* createCollection(
  getState: GetStateFn,
  action: ActionType<typeof actions.createCollection>
): SagaGen {
  const { bid, collectionData } = action;
  try {
    const { id: cid, ...data } = collectionData;
    const bucket = getBucket(bid);
    yield call([bucket, bucket.createCollection], cid, { data, safe: true });
    // yield put(redirectTo("collection:records", { bid, cid }));
    notifySuccess("Collection created.");
    yield put(listBuckets());
  } catch (error) {
    notifyError("Couldn't create collection.", error);
  }
}

export function* updateCollection(
  getState: GetStateFn,
  action: ActionType<typeof actions.updateCollection>
): SagaGen {
  const {
    bid,
    cid,
    collection: { data, permissions },
  } = action;
  try {
    const coll = getCollection(bid, cid);
    if (data) {
      yield call([coll, coll.setData], data, { safe: true });
      // TODO: yield put(redirectTo("collection:attributes", { bid, cid }));
      notifySuccess("Collection attributes updated.");
    } else if (permissions) {
      yield call([coll, coll.setPermissions], permissions, {
        safe: true,
        last_modified: data.last_modified,
      });
      // yield put(redirectTo("collection:permissions", { bid, cid }));
      notifySuccess("Collection permissions updated.");
    }
  } catch (error) {
    notifyError("Couldn't update collection.", error);
  }
}

export function* deleteCollection(
  getState: GetStateFn,
  action: ActionType<typeof actions.deleteCollection>
): SagaGen {
  const { bid, cid } = action;
  const {
    collection: {
      data: { last_modified },
    },
  } = getState();
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteCollection], cid, {
      safe: true,
      last_modified,
    });
    // yield put(redirectTo("bucket:collections", { bid }));
    notifySuccess("Collection deleted.");
    yield put(listBuckets());
  } catch (error) {
    notifyError("Couldn't delete collection.", error);
  }
}
