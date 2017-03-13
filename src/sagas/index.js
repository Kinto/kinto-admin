/* @flow */
import type { GetStateFn, PluginSagas, SagaGen } from "../types";

import { takeEvery } from "redux-saga";

import { flattenPluginsSagas } from "../plugin";
import * as c from "../constants";
import * as sessionSagas from "./session";
import * as routeSagas from "./route";
import * as bucketSagas from "./bucket";
import * as groupSagas from "./group";
import * as collectionSagas from "./collection";
import * as recordSagas from "./record";

/**
 * Registers saga watchers.
 *
 * @param {Function} getState Function to obtain the current store state.
 * @param {Array}    sagas  The list of plugin sagas.
 */
export default function* rootSaga(
  getState: GetStateFn,
  pluginsSagas: PluginSagas = []
): SagaGen {
  const standardSagas = [
    // session
    takeEvery(c.SESSION_SETUP, sessionSagas.setupSession, getState),
    takeEvery(c.SESSION_BUCKETS_REQUEST, sessionSagas.listBuckets, getState),
    takeEvery(c.SESSION_LOGOUT, sessionSagas.sessionLogout, getState),
    // route
    takeEvery(c.ROUTE_REDIRECT, routeSagas.routeRedirect, getState),
    takeEvery(c.ROUTE_UPDATED, routeSagas.routeUpdated, getState),
    // bucket
    takeEvery(c.BUCKET_CREATE_REQUEST, bucketSagas.createBucket, getState),
    takeEvery(c.BUCKET_UPDATE_REQUEST, bucketSagas.updateBucket, getState),
    takeEvery(c.BUCKET_DELETE_REQUEST, bucketSagas.deleteBucket, getState),
    // bucket/collections
    takeEvery(
      c.BUCKET_COLLECTIONS_REQUEST,
      bucketSagas.listBucketCollections,
      getState
    ),
    takeEvery(
      c.BUCKET_COLLECTIONS_NEXT_REQUEST,
      bucketSagas.listBucketNextCollections,
      getState
    ),
    takeEvery(c.BUCKET_HISTORY_REQUEST, bucketSagas.listHistory, getState),
    takeEvery(
      c.BUCKET_HISTORY_NEXT_REQUEST,
      bucketSagas.listNextHistory,
      getState
    ),
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
    takeEvery(c.GROUP_HISTORY_REQUEST, groupSagas.listHistory, getState),
    takeEvery(
      c.GROUP_HISTORY_NEXT_REQUEST,
      groupSagas.listNextHistory,
      getState
    ),
    // collection/records
    takeEvery(
      c.COLLECTION_RECORDS_REQUEST,
      collectionSagas.listRecords,
      getState
    ),
    takeEvery(
      c.COLLECTION_RECORDS_NEXT_REQUEST,
      collectionSagas.listNextRecords,
      getState
    ),
    takeEvery(
      c.COLLECTION_HISTORY_REQUEST,
      collectionSagas.listHistory,
      getState
    ),
    takeEvery(
      c.COLLECTION_HISTORY_NEXT_REQUEST,
      collectionSagas.listNextHistory,
      getState
    ),
    takeEvery(c.RECORD_CREATE_REQUEST, collectionSagas.createRecord, getState),
    takeEvery(
      c.RECORD_BULK_CREATE_REQUEST,
      collectionSagas.bulkCreateRecords,
      getState
    ),
    takeEvery(c.RECORD_UPDATE_REQUEST, collectionSagas.updateRecord, getState),
    takeEvery(c.RECORD_DELETE_REQUEST, collectionSagas.deleteRecord, getState),
    takeEvery(c.RECORD_HISTORY_REQUEST, recordSagas.listHistory, getState),
    takeEvery(
      c.RECORD_HISTORY_NEXT_REQUEST,
      recordSagas.listNextHistory,
      getState
    ),
    // attachments
    takeEvery(
      c.ATTACHMENT_DELETE_REQUEST,
      collectionSagas.deleteAttachment,
      getState
    ),
  ];

  yield [...standardSagas, ...flattenPluginsSagas(pluginsSagas, getState)];
}
