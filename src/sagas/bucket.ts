import * as actions from "@src/actions/bucket";
import { notifyError, notifySuccess } from "@src/actions/notifications";
import { redirectTo } from "@src/actions/route";
import { listBuckets, sessionBusy } from "@src/actions/session";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import type { ActionType, GetStateFn, SagaGen } from "@src/types";
import { call, put } from "redux-saga/effects";

function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* createBucket(
  getState: GetStateFn,
  action: ActionType<typeof actions.createBucket>
): SagaGen {
  const { bid, data } = action;
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.createBucket], bid, { data, safe: true });
    yield put(listBuckets());
    yield put(redirectTo("bucket:attributes", { bid }));
    yield put(notifySuccess("Bucket created."));
  } catch (error) {
    yield put(notifyError("Couldn't create bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* updateBucket(
  getState: GetStateFn,
  action: ActionType<typeof actions.updateBucket>
): SagaGen {
  const {
    bid,
    bucket: { data, permissions },
  } = action;
  const {
    bucket: {
      data: { last_modified },
    },
  } = getState();
  try {
    const bucket = getBucket(bid);
    yield put(sessionBusy(true));
    if (data) {
      const updatedBucket = { ...data, last_modified };
      yield call([bucket, bucket.setData], updatedBucket, {
        safe: true,
      });
      yield put(redirectTo("bucket:attributes", { bid }));
      yield put(notifySuccess("Bucket attributes updated."));
    } else if (permissions) {
      yield call([bucket, bucket.setPermissions], permissions, {
        safe: true,
        last_modified,
      });
      yield put(redirectTo("bucket:permissions", { bid }));
      yield put(notifySuccess("Bucket permissions updated."));
    }
  } catch (error) {
    yield put(notifyError("Couldn't update bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* deleteBucket(
  getState: GetStateFn,
  action: ActionType<typeof actions.deleteBucket>
): SagaGen {
  const { bid } = action;
  const {
    bucket: {
      data: { last_modified },
    },
  } = getState();
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.deleteBucket], bid, {
      safe: true,
      last_modified,
    });
    yield put(listBuckets());
    yield put(redirectTo("home", {}));
    yield put(notifySuccess("Bucket deleted."));
  } catch (error) {
    yield put(notifyError("Couldn't delete bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
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
    yield put(redirectTo("collection:records", { bid, cid }));
    yield put(notifySuccess("Collection created."));
    yield put(listBuckets());
  } catch (error) {
    yield put(notifyError("Couldn't create collection.", error));
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
  const {
    collection: {
      data: { last_modified },
    },
  } = getState();
  try {
    const coll = getCollection(bid, cid);
    if (data) {
      const updatedCollection = { ...data, last_modified };
      yield call([coll, coll.setData], updatedCollection, { safe: true });
      yield put(redirectTo("collection:attributes", { bid, cid }));
      yield put(notifySuccess("Collection attributes updated."));
    } else if (permissions) {
      yield call([coll, coll.setPermissions], permissions, {
        safe: true,
        last_modified,
      });
      yield put(redirectTo("collection:permissions", { bid, cid }));
      yield put(notifySuccess("Collection permissions updated."));
    }
  } catch (error) {
    yield put(notifyError("Couldn't update collection.", error));
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
    yield put(redirectTo("bucket:collections", { bid }));
    yield put(notifySuccess("Collection deleted."));
    yield put(listBuckets());
  } catch (error) {
    yield put(notifyError("Couldn't delete collection.", error));
  }
}

export function* listBucketCollections(
  getState: GetStateFn,
  action: ActionType<typeof actions.listBucketCollections>
): SagaGen {
  const { bid } = action;
  try {
    const bucket = getBucket(bid);
    const { data, hasNextPage, next } = yield call(
      [bucket, bucket.listCollections],
      {
        limit: MAX_PER_PAGE,
      }
    );
    yield put(actions.listBucketCollectionsSuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't list bucket collections.", error));
  }
}

export function* listBucketNextCollections(getState: GetStateFn): SagaGen {
  const {
    bucket: {
      collections: { next: fetchNextCollections },
    },
  } = getState();
  if (fetchNextCollections == null) {
    return;
  }
  try {
    const { data, hasNextPage, next } = yield call(fetchNextCollections);
    yield put(actions.listBucketCollectionsSuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't process next page.", error));
  }
}

export function* listHistory(
  getState: GetStateFn,
  action: ActionType<typeof actions.listBucketHistory>
): SagaGen {
  const {
    bid,
    filters: { resource_name },
  } = action;
  try {
    const bucket = getBucket(bid);
    const { data, hasNextPage, next } = yield call(
      [bucket, bucket.listHistory],
      {
        limit: MAX_PER_PAGE,
        filters: {
          resource_name,
          exclude_resource_name: "record",
        },
      }
    );
    yield put(actions.listBucketHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't list bucket history.", error));
  }
}

export function* listNextHistory(getState: GetStateFn): SagaGen {
  const {
    bucket: {
      history: { next: fetchNextHistory },
    },
  } = getState();
  if (fetchNextHistory == null) {
    return;
  }
  try {
    const { data, hasNextPage, next } = yield call(fetchNextHistory);
    yield put(actions.listBucketHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't process next page.", error));
  }
}

export function* createGroup(
  getState: GetStateFn,
  action: ActionType<typeof actions.createGroup>
): SagaGen {
  const { bid, groupData } = action;
  try {
    const { id: gid, members } = groupData;
    const bucket = getBucket(bid);
    yield call([bucket, bucket.createGroup], gid, members, {
      data: groupData,
      safe: true,
    });
    yield put(redirectTo("bucket:groups", { bid }));
    yield put(notifySuccess("Group created."));
  } catch (error) {
    yield put(notifyError("Couldn't create group.", error));
  }
}

export function* updateGroup(
  getState: GetStateFn,
  action: ActionType<typeof actions.updateGroup>
): SagaGen {
  const {
    bid,
    gid,
    group: { data, permissions },
  } = action;
  const {
    group: { data: loadedData },
  } = getState();
  if (!loadedData) {
    return;
  }
  const { last_modified } = loadedData;
  try {
    const bucket = getBucket(bid);
    if (data) {
      const updatedGroup = { ...data, id: gid, last_modified };
      yield call([bucket, bucket.updateGroup], updatedGroup, { safe: true });
      yield put(redirectTo("bucket:groups", { bid }));
      yield put(notifySuccess("Group attributes updated."));
    } else if (permissions) {
      yield call([bucket, bucket.updateGroup], loadedData, {
        permissions,
        last_modified,
        safe: true,
      });
      yield put(redirectTo("group:permissions", { bid, gid }));
      yield put(notifySuccess("Group permissions updated."));
    }
  } catch (error) {
    yield put(notifyError("Couldn't update group.", error));
  }
}

export function* deleteGroup(
  getState: GetStateFn,
  action: ActionType<typeof actions.deleteGroup>
): SagaGen {
  const { bid, gid } = action;
  const {
    group: { data: loadedData },
  } = getState();
  if (!loadedData) {
    return;
  }
  const { last_modified } = loadedData;
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteGroup], gid, {
      safe: true,
      last_modified,
    });
    yield put(redirectTo("bucket:groups", { bid }));
    yield put(notifySuccess("Group deleted."));
  } catch (error) {
    yield put(notifyError("Couldn't delete group.", error));
  }
}
