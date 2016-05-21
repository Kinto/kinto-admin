import { fork } from "redux-saga/effects";

import * as sessionSagas from "./session";


export default function* rootSaga() {
  yield [
    fork(sessionSagas.watchSessionSetup),
    fork(sessionSagas.watchSessionLogout),
    fork(sessionSagas.watchSessionBuckets),
  ];
}
