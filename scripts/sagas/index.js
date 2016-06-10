import { takeLatest } from "redux-saga";
import { fork } from "redux-saga/effects";

import { SESSION_SERVERINFO_SUCCESS } from "../constants";
import * as sessionSagas from "./session";
import * as routeSagas from "./route";
import * as bucketSagas from "./bucket";
import * as collectionSagas from "./collection";


export default function* rootSaga() {
  yield [
    // session
    fork(sessionSagas.watchSessionSetup),
    fork(sessionSagas.watchSessionSetupComplete),
    fork(sessionSagas.watchSessionLogout),
    fork(sessionSagas.watchSessionBuckets),
    // route
    fork(routeSagas.watchRouteUpdated),
    // bucket/collections
    fork(bucketSagas.watchBucketCreate),
    fork(bucketSagas.watchBucketUpdate),
    fork(bucketSagas.watchBucketDelete),
    fork(bucketSagas.watchCollectionCreate),
    fork(bucketSagas.watchCollectionUpdate),
    fork(bucketSagas.watchCollectionDelete),
    // collection/records
    fork(collectionSagas.watchCollectionRecords),
    fork(collectionSagas.watchRecordDelete),
    fork(collectionSagas.watchBulkCreateRecords),
    fork(collectionSagas.watchAttachmentDelete),
    // Ensure restarting session info dependent watchers when info are updated
    fork(function* () {
      yield* takeLatest(SESSION_SERVERINFO_SUCCESS,
                        collectionSagas.watchRecordCreate);
    }),
    fork(function* () {
      yield* takeLatest(SESSION_SERVERINFO_SUCCESS,
                        collectionSagas.watchRecordUpdate);
    }),
  ];
}
