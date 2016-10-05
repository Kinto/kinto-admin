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
    yield put(updatePath(`/buckets/${bid}/edit`));
    yield put(notifySuccess("Bucket created."));
  } catch(error) {
    yield put(notifyError("Couldn't create bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* updateBucket(getState, action) {
  const {bid, bucketData} = action;
  const {last_modified} = bucketData;
  try {
    const bucket = getBucket(bid);
    yield put(sessionBusy(true));
    yield call([bucket, bucket.setData], bucketData, {safe: true, last_modified});
    yield put(notifySuccess("Bucket updated."));
  } catch(error) {
    yield put(notifyError("Couldn't update bucket.", error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* deleteBucket(getState, action) {
  const { bid, last_modified } = action;
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
  const {bid, cid, collectionData} = action;
  const {last_modified} = collectionData;
  try {
    const coll = getCollection(bid, cid);
    yield call([coll, coll.setData], collectionData, {safe: true, last_modified});
    yield put(updatePath(`/buckets/${bid}/collections/${cid}/records`));
    yield put(notifySuccess("Collection properties updated."));
  } catch(error) {
    yield put(notifyError("Couldn't update collection.", error));
  }
}

export function* deleteCollection(getState, action) {
  const {bid, cid, last_modified} = action;
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
  const {bid} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listHistory], {
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
    yield put(updatePath(`/buckets/${bid}/groups/${gid}/edit`));
    yield put(notifySuccess("Group created."));
  } catch(error) {
    yield put(notifyError("Couldn't create group.", error));
  }
}

export function* updateGroup(getState, action) {
  const {bid, gid, groupData} = action;
  try {
    const bucket = getBucket(bid);
    const group = {id: gid, ...groupData};
    yield call([bucket, bucket.updateGroup], group);
    yield put(updatePath(`/buckets/${bid}/groups/${gid}/edit`));
    yield put(notifySuccess("Group properties updated."));
  } catch(error) {
    yield put(notifyError("Couldn't update group.", error));
  }
}

export function* deleteGroup(getState, action) {
  const {bid, gid} = action;
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteGroup], gid);
    yield put(updatePath(`/buckets/${bid}/groups`));
    yield put(notifySuccess("Group deleted."));
  } catch(error) {
    yield put(notifyError("Couldn't delete group.", error));
  }
}
