import { takeEvery } from "redux-saga";

import * as c from "../constants";
import * as sessionSagas from "./session";
import * as routeSagas from "./route";
import * as bucketSagas from "./bucket";
import * as collectionSagas from "./collection";


function flattenPluginSagas(plugins, getState) {
  return plugins.reduce((acc, plugin) => {
    const sagas = plugin.sagas.map(([fn, ...args]) => fn(...args, getState));
    return [...acc, ...sagas];
  }, []);
}

/**
 * Registers saga watchers.
 *
 * @param {Function} getState Function to obtain the current store state.
 * @param {Array}    plugins  The list of plugins.
 */
export default function* rootSaga(getState, plugins=[]) {
  const standardSagas = [
    // session
    takeEvery(c.SESSION_SETUP, sessionSagas.setupSession, getState),
    takeEvery(c.SESSION_SETUP_COMPLETE, sessionSagas.completeSessionSetup, getState),
    takeEvery(c.SESSION_BUCKETS_REQUEST, sessionSagas.listBuckets, getState),
    takeEvery(c.SESSION_LOGOUT, sessionSagas.sessionLogout, getState),
    // route
    takeEvery(c.ROUTE_UPDATED, routeSagas.routeUpdated, getState),
    // bucket/collections
    takeEvery(c.BUCKET_CREATE_REQUEST, bucketSagas.createBucket, getState),
    takeEvery(c.BUCKET_UPDATE_REQUEST, bucketSagas.updateBucket, getState),
    takeEvery(c.BUCKET_DELETE_REQUEST, bucketSagas.deleteBucket, getState),
    takeEvery(c.COLLECTION_CREATE_REQUEST, bucketSagas.createCollection, getState),
    takeEvery(c.COLLECTION_UPDATE_REQUEST, bucketSagas.updateCollection, getState),
    takeEvery(c.COLLECTION_DELETE_REQUEST, bucketSagas.deleteCollection, getState),
    // collection/records
    takeEvery(c.COLLECTION_RECORDS_REQUEST, collectionSagas.listRecords, getState),
    takeEvery(c.RECORD_CREATE_REQUEST, collectionSagas.createRecord, getState),
    takeEvery(c.RECORD_UPDATE_REQUEST, collectionSagas.updateRecord, getState),
    takeEvery(c.RECORD_DELETE_REQUEST, collectionSagas.deleteRecord, getState),
    takeEvery(c.RECORD_BULK_CREATE_REQUEST, collectionSagas.bulkCreateRecords, getState),
    // attachments
    takeEvery(c.ATTACHMENT_DELETE_REQUEST, collectionSagas.deleteAttachment, getState),
  ];

  yield [...standardSagas, ...flattenPluginSagas(plugins, getState)];
}
