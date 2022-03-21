import type { ActionType, GetStateFn, SagaGen } from "../types";

import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifyError } from "../actions/notifications";
import * as actions from "../actions/record";
import { MAX_PER_PAGE } from "../constants";

function getBucket(bid) {
  return getClient().bucket(bid);
}

export function* listHistory(
  getState: GetStateFn,
  action: ActionType<typeof actions.listRecordHistory>
): SagaGen {
  const { bid, cid, rid } = action;
  try {
    const bucket = getBucket(bid);
    const { data, hasNextPage, next } = yield call(
      [bucket, bucket.listHistory],
      {
        limit: MAX_PER_PAGE,
        filters: {
          collection_id: cid,
          record_id: rid,
        },
      }
    );
    yield put(actions.listRecordHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't list record history.", error));
  }
}

export function* listNextHistory(getState: GetStateFn): SagaGen {
  const {
    record: {
      history: { next: fetchNextHistory },
    },
  } = getState();
  if (fetchNextHistory == null) {
    return;
  }
  try {
    const { data, hasNextPage, next } = yield call(fetchNextHistory);
    yield put(actions.listRecordHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't process next page.", error));
  }
}
