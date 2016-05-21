import { fork } from "redux-saga/effects";

import * as sessionSagas from "./session";
import * as bucketSagas from "./bucket";


export default function* rootSaga() {
  yield [
    // session
    fork(sessionSagas.watchSessionSetup),
    fork(sessionSagas.watchSessionLogout),
    fork(sessionSagas.watchSessionBuckets),
    // bucket
    fork(bucketSagas.watchCollectionCreate),
  ];
}
