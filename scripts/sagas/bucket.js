import { push as updatePath } from "react-router-redux";
import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { sessionBusy, listBuckets } from "../actions/session";
import { bucketLoadSuccess } from "../actions/bucket";
import { groupLoadSuccess } from "../actions/group";
import { collectionLoadSuccess } from "../actions/collection";


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
    yield call([client, client.createBucket], bid, {data});
    yield put(listBuckets());
    yield put(updatePath(`/buckets/${bid}/edit`));
    yield put(notifySuccess("Bucket created."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* updateBucket(getState, action) {
  const {bid, bucketData} = action;
  try {
    const bucket = getBucket(bid);
    yield put(sessionBusy(true));
    const {data, permissions} = yield call([bucket, bucket.setData], bucketData);
    yield put(bucketLoadSuccess(data, permissions));
    yield put(notifySuccess("Bucket updated."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* deleteBucket(getState, action) {
  const { bid } = action;
  try {
    const client = getClient();
    yield put(sessionBusy(true));
    yield call([client, client.deleteBucket], bid);
    yield put(listBuckets());
    yield put(updatePath("/"));
    yield put(notifySuccess("Bucket deleted."));
  } catch(error) {
    yield put(notifyError(error));
  } finally {
    yield put(sessionBusy(false));
  }
}

export function* createCollection(getState, action) {
  const {bid, collectionData} = action;
  try {
    const {
      name,
      schema,
      uiSchema,
      attachment,
      sort,
      displayFields,
    } = collectionData;
    const bucket = getBucket(bid);
    yield call([bucket, bucket.createCollection], name, {
      data: {uiSchema, schema, attachment, sort, displayFields},
    });
    yield put(updatePath(`/buckets/${bid}/collections/${name}`));
    yield put(notifySuccess("Collection created."));
    yield put(listBuckets());
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* updateCollection(getState, action) {
  const {bid, cid, collectionData} = action;
  try {
    const coll = getCollection(bid, cid);
    const {data, permissions} = yield call([coll, coll.setData], collectionData);
    yield put(collectionLoadSuccess({...data, bucket: bid}, permissions));
    yield put(updatePath(`/buckets/${bid}/collections/${cid}`));
    yield put(notifySuccess("Collection properties updated."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* deleteCollection(getState, action) {
  const {bid, cid} = action;
  try {
    const bucket = getBucket(bid);
    yield call([bucket, bucket.deleteCollection], cid);
    yield put(updatePath(""));
    yield put(notifySuccess("Collection deleted."));
    yield put(listBuckets());
  } catch(error) {
    yield put(notifyError(error));
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
    });
    yield put(updatePath(`/buckets/${bid}/groups/${gid}/edit`));
    yield put(notifySuccess("Group created."));
  } catch(error) {
    yield put(notifyError(error));
  }
}

export function* updateGroup(getState, action) {
  const {bid, gid, groupData} = action;
  try {
    const bucket = getBucket(bid);
    const group = {id: gid, ...groupData};
    const {data, permissions} = yield call([bucket, bucket.updateGroup], group);
    yield put(groupLoadSuccess(data, permissions));
    yield put(updatePath(`/buckets/${bid}/groups/${gid}/edit`));
    yield put(notifySuccess("Group properties updated."));
  } catch(error) {
    yield put(notifyError(error));
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
    yield put(notifyError(error));
  }
}
