import { fork } from "redux-saga/effects";

import * as sessionSagas from "./session";
import * as bucketSagas from "./bucket";
import * as collectionSagas from "./collection";


export default function* rootSaga() {
  yield [
    // session
    fork(sessionSagas.watchSessionSetup),
    fork(sessionSagas.watchSessionLogout),
    fork(sessionSagas.watchSessionBuckets),
    // bucket
    fork(bucketSagas.watchCollectionLoad),
    fork(bucketSagas.watchCollectionCreate),
    fork(bucketSagas.watchCollectionUpdate),
    fork(bucketSagas.watchCollectionDelete),
    // collection
    fork(collectionSagas.watchCollectionRecords),
  ];
}
