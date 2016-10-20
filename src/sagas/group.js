import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifyError } from "../actions/notifications";
import * as actions from "../actions/group";


function getBucket(bid) {
  return getClient().bucket(bid);
}

export function* listHistory(getState, action) {
  const {bid, gid, filters: {since}} = action;
  try {
    const bucket = getBucket(bid);
    const {data} = yield call([bucket, bucket.listHistory], {
      since,
      filters: {
        group_id: gid,
      }
    });
    yield put(actions.listGroupHistorySuccess(data));
  } catch(error) {
    yield put(notifyError("Couldn't list group history.", error));
  }
}
