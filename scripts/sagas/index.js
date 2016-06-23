import { takeEvery, takeLatest } from "redux-saga";
import { fork } from "redux-saga/effects";

import {
  SESSION_SERVERINFO_SUCCESS,
  BUCKET_CREATE_REQUEST,
  BUCKET_UPDATE_REQUEST,
  BUCKET_DELETE_REQUEST,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
} from "../constants";
import * as sessionSagas from "./session";
import * as routeSagas from "./route";
import * as bucketSagas from "./bucket";
import * as collectionSagas from "./collection";


/**
 * @param {function} getState Function to obtain the current store state.
 */
export default function* rootSaga(getState) {
  yield [
    // session
    fork(sessionSagas.watchSessionSetup),
    fork(sessionSagas.watchSessionSetupComplete),
    fork(sessionSagas.watchSessionLogout),
    fork(sessionSagas.watchSessionBuckets),
    // route
    fork(routeSagas.watchRouteUpdated),
    // bucket/collections
    // fork(bucketSagas.watchBucketCreate, getState),
    takeEvery(BUCKET_CREATE_REQUEST, bucketSagas.createBucket, getState),
    takeEvery(BUCKET_UPDATE_REQUEST, bucketSagas.updateBucket, getState),
    takeEvery(BUCKET_DELETE_REQUEST, bucketSagas.deleteBucket, getState),
    takeEvery(COLLECTION_CREATE_REQUEST, bucketSagas.createCollection, getState),
    takeEvery(COLLECTION_UPDATE_REQUEST, bucketSagas.updateCollection, getState),
    fork(bucketSagas.watchCollectionDelete),
    // collection/records
    fork(collectionSagas.watchListRecords),
    fork(collectionSagas.watchRecordDelete),
    fork(collectionSagas.watchBulkCreateRecords),
    fork(collectionSagas.watchAttachmentDelete),
    fork(collectionSagas.watchRecordUpdate, getState),
    // Ensure resetting context dependant watchers when context changes
    fork(function* () {
      yield* takeLatest(SESSION_SERVERINFO_SUCCESS,
                        collectionSagas.watchRecordCreate);
    }),
  ];
}
