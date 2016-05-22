import { updatePath } from "redux-simple-router";
import { call, take, fork, put } from "redux-saga/effects";

import {
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
} from "../constants";
import { getClient } from "./client";
import { notifySuccess, notifyError } from "../actions/notifications";
import { collectionRecordsSuccess } from "../actions/collection";


function getBucket(bid) {
  return getClient().bucket(bid);
}

function getCollection(bid, cid) {
  return getBucket(bid).collection(cid);
}

export function* listRecords(bid, cid) {
  const coll = getCollection(bid, cid);
  try {
    const {data} = yield call([coll, coll.listRecords]);
    yield put(collectionRecordsSuccess(data));
  } catch(error) {
    yield put(notifyError(error));
  }
}

// Watchers

export function* watchCollectionRecords() {
  while(true) {
    const {bid, cid} = yield take(COLLECTION_RECORDS_REQUEST);
    yield fork(listRecords, bid, cid);
  }
}
