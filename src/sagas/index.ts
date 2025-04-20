import * as sessionSagas from "./session";
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
  ];

  yield all(sagas);
}
