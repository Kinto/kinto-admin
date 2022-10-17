import type { ActionType, GetStateFn, SagaGen } from "../types";

import { call, put } from "redux-saga/effects";

import { getClient } from "../client";
import { notifyError } from "../actions/notifications";
import * as actions from "../actions/group";
import { MAX_PER_PAGE } from "../constants";

function getBucket(bid) {
  return getClient().bucket(bid);
}

export function* listHistory(
  getState: GetStateFn,
  action: ActionType<typeof actions.listGroupHistory>
): SagaGen {
  const { bid, gid } = action;
  try {
    const bucket = getBucket(bid);
    const { data, hasNextPage, next } = yield call(
      [bucket, bucket.listHistory],
      {
        limit: MAX_PER_PAGE,
        filters: {
          group_id: gid,
        },
      }
    );
    yield put(actions.listGroupHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't list group history.", error));
  }
}

export function* listNextHistory(getState: GetStateFn): SagaGen {
  const {
    group: {
      history: { next: fetchNextHistory },
    },
  } = getState();
  if (fetchNextHistory == null) {
    return;
  }
  try {
    const { data, hasNextPage, next } = yield call(fetchNextHistory);
    yield put(actions.listGroupHistorySuccess(data, hasNextPage, next));
  } catch (error) {
    yield put(notifyError("Couldn't process next page.", error));
  }
}
