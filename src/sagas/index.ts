import * as bucketSagas from "./bucket";
import * as heartbeatSagas from "./heartbeat";
import * as sessionSagas from "./session";
import * as signoffSagas from "./signoff";
import * as c from "@src/constants";
import type { GetStateFn, SagaGen } from "@src/types";
import { all, takeEvery } from "redux-saga/effects";

/**
 * Registers saga watchers.
 *
 * @param {Function} getState Function to obtain the current store state.
 */
export default function* rootSaga(getState: GetStateFn): SagaGen {
  const sagas = [
    // session
    takeEvery(c.SESSION_SETUP, sessionSagas.setupSession, getState),
    takeEvery(c.SESSION_SERVER_CHANGE, sessionSagas.serverChange, getState),
    takeEvery(c.SESSION_GET_SERVERINFO, sessionSagas.getServerInfo, getState),
    takeEvery(c.SESSION_BUCKETS_REQUEST, sessionSagas.listBuckets, getState),
    takeEvery(c.SESSION_LOGOUT, sessionSagas.sessionLogout, getState),
    takeEvery(
      c.SESSION_COPY_AUTHENTICATION_HEADER,
      sessionSagas.sessionCopyAuthenticationHeader,
      getState
    ),
    // bucket/collections
    takeEvery(
      c.COLLECTION_CREATE_REQUEST,
      bucketSagas.createCollection,
      getState
    ),
    takeEvery(
      c.COLLECTION_UPDATE_REQUEST,
      bucketSagas.updateCollection,
      getState
    ),
    takeEvery(
      c.COLLECTION_DELETE_REQUEST,
      bucketSagas.deleteCollection,
      getState
    ),
    // bucket/groups
    takeEvery(c.GROUP_CREATE_REQUEST, bucketSagas.createGroup, getState),
    takeEvery(c.GROUP_UPDATE_REQUEST, bucketSagas.updateGroup, getState),
    takeEvery(c.GROUP_DELETE_REQUEST, bucketSagas.deleteGroup, getState),
    // signoff
    takeEvery(
      c.SIGNOFF_REVIEW_REQUEST,
      signoffSagas.handleRequestReview,
      getState
    ),
    takeEvery(
      c.SIGNOFF_ROLLBACK_CHANGES,
      signoffSagas.handleRollbackChanges,
      getState
    ),
    takeEvery(
      c.SIGNOFF_DECLINE_REQUEST,
      signoffSagas.handleDeclineChanges,
      getState
    ),
    takeEvery(
      c.SIGNOFF_SIGNOFF_REQUEST,
      signoffSagas.handleApproveChanges,
      getState
    ),
    // heartbeat
    takeEvery(c.HEARTBEAT_REQUEST, heartbeatSagas.heartbeatRequest, getState),
  ];

  yield all(sagas);
}
