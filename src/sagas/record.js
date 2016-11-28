/* @flow */
import type { ActionType, GetStateFn, SagaGen } from "../types";

import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifyError } from "../actions/notifications";
import * as actions from "../actions/record";


function getBucket(bid) {
  return getClient().bucket(bid);
}

export function* listHistory(getState: GetStateFn, action: ActionType<typeof actions.listRecordHistory>): SagaGen {
  const {bid, cid, rid, filters: {since}} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listHistory], {
      since,
      filters: {
        collection_id: cid,
        record_id: rid,
      }
    });
    yield put(actions.listRecordHistorySuccess(data));
  } catch(error) {
    yield put(notifyError("Couldn't list record history.", error));
  }
}
