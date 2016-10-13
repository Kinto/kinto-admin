import { push as updatePath } from "react-router-redux";
import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { sessionBusy, listBuckets } from "../actions/session";
import {
  listBucketCollectionsSuccess,
  listBucketGroupsSuccess,
  listBucketHistorySuccess,
} from "../actions/bucket";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* createBucket(getState, action) {
  const {bid, data} = action;
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.createBucket], bid, {data, safe: true});
    yield put(listBuckets());
    yield put(updatePath(`/buckets/${bid}/attributes`));
    yield put(notifySuccess("Bucket created."));
  } catch(error) {
    yield put(notifyError("Couldn't create bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* updateBucket(getState, action) {
  const {bid, bucket: {data, permissions}} = action;
  const {bucket: {data: {last_modified}}} = getState();
  try {
    const bucket = getBucket(bid);
    yield put(sessionBusy(true));
    if (data) {
      const updatedBucket = {...data, last_modified};
      yield call([bucket, bucket.setData], updatedBucket, {
        patch: true,
        safe: true,
      });
      yield put(updatePath(`/buckets/${bid}/attributes`));
      yield put(notifySuccess("Bucket attributes updated."));
    } else if (permissions) {
      yield call([bucket, bucket.setPermissions], permissions, {
        safe: true,
        last_modified,
      });
      yield put(updatePath(`/buckets/${bid}/permissions`));
      yield put(notifySuccess("Bucket permissions updated."));
    }
  } catch(error) {
    yield put(notifyError("Couldn't update bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* deleteBucket(getState, action) {
  const {bid} = action;
  const {bucket: {data: {last_modified}}} = getState();
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.deleteBucket], bid, {safe: true, last_modified});
    yield put(listBuckets());
    yield put(updatePath("/"));
    yield put(notifySuccess("Bucket deleted."));
  } catch(error) {
    yield put(notifyError("Couldn't delete bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* createCollection(getState, action) {
  const {bid, collectionData} = action;
  try {
    const {id, ...data} = collectionData;
    const bucket = getBucket(bid);
    yield call([bucket, bucket.createCollection], id, {data, safe: true});
    yield put(updatePath(`/buckets/${bid}/collections/${id}`));
    yield put(notifySuccess("Collection created."));
    yield put(listBuckets());
  } catch(error) {
    yield put(notifyError("Couldn't create collection.", error));
  }
}

export function* updateCollection(getState, action) {
  const {bid, cid, collection: {data, permissions}} = action;
  const {collection: {data: {last_modified}}} = getState();
  try {
    const coll = getCollection(bid, cid);
    if (data) {
      const updatedCollection = {...data, last_modified};
      yield call([coll, coll.setData], updatedCollection, {
        patch: true,
        safe: true});
      yield put(updatePath(`/buckets/${bid}/collections/${cid}/records`));
      yield put(notifySuccess("Collection attributes updated."));
    } else if (permissions) {
      yield call([coll, coll.setPermissions], permissions, {
        safe: true,
        last_modified,
      });
      yield put(updatePath(`/buckets/${bid}/collections/${cid}/permissions`));
      yield put(notifySuccess("Collection permissions updated."));
    }
  } catch(error) {
    yield put(notifyError("Couldn't update collection.", error));
  }
}

export function* deleteCollection(getState, action) {
  const {bid, cid} = action;
  const {collection: {data: {last_modified}}} = getState();
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteCollection], cid, {safe: true, last_modified});
    yield put(updatePath(""));
    yield put(notifySuccess("Collection deleted."));
    yield put(listBuckets());
  } catch(error) {
    yield put(notifyError("Couldn't delete collection.", error));
  }
}

export function* listBucketCollections(getState, action) {
  const {bid} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listCollections]);
    yield put(listBucketCollectionsSuccess(data));
  } catch(error) {
    yield put(notifyError("Couldn't list bucket collections.", error));
  }
}

export function* listBucketGroups(getState, action) {
  const {bid} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listGroups]);
    yield put(listBucketGroupsSuccess(data));
  } catch(error) {
    yield put(notifyError("Couldn't list bucket groups.", error));
  }
}

export function* listBucketHistory(getState, action) {
  const {bid, since} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listHistory], {
      since,
      filters: {
        exclude_resource_name: "record"
      }
    });
    yield put(listBucketHistorySuccess(data));
  } catch(error) {
    yield put(notifyError("Couldn't list bucket history.", error));
  }
}

export function* createGroup(getState, action) {
  const {bid, groupData} = action;
  try {
    const {
      id: gid,
      members,
    } = groupData;
    const bucket = getBucket(bid);
    yield call([bucket, bucket.createGroup], gid, members, {
      data: groupData,
      safe: true
    });
    yield put(updatePath(`/buckets/${bid}/groups/${gid}/attributes`));
    yield put(notifySuccess("Group created."));
  } catch(error) {
    yield put(notifyError("Couldn't create group.", error));
  }
}

export function* updateGroup(getState, action) {
  const {bid, gid, group: {data, permissions}} = action;
  const {group: {data: loadedData}} = getState();
  const {last_modified} = loadedData;
  try {
    const bucket = getBucket(bid);
    if (data) {
      const updatedGroup = {...data, id: gid, last_modified};
      yield call([bucket, bucket.updateGroup], updatedGroup, {
        patch: true,
        safe: true});
      yield put(updatePath(`/buckets/${bid}/groups/${gid}/attributes`));
      yield put(notifySuccess("Group attributes updated."));
    } else if (permissions) {
      yield call([bucket, bucket.updateGroup], loadedData, {
        permissions,
        last_modified,
        safe: true});
      yield put(updatePath(`/buckets/${bid}/groups/${gid}/permissions`));
      yield put(notifySuccess("Group permissions updated."));
    }
  } catch(error) {
    yield put(notifyError("Couldn't update group.", error));
  }
}

export function* deleteGroup(getState, action) {
  const {bid, gid} = action;
  const {group: {data: {last_modified}}} = getState();
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteGroup], gid, {safe: true, last_modified});
    yield put(updatePath(`/buckets/${bid}/groups`));
    yield put(notifySuccess("Group deleted."));
  } catch(error) {
    yield put(notifyError("Couldn't delete group.", error));
  }
}
