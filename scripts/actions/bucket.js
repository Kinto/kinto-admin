/* @flow */

import type {
  Action,
  BucketData,
  BucketPermissions,
  CollectionData,
} from "../types";
import {
  BUCKET_BUSY,
  BUCKET_LOAD_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  BUCKET_CREATE_REQUEST,
  BUCKET_UPDATE_REQUEST,
  BUCKET_DELETE_REQUEST,
  BUCKET_RESET,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
} from "../constants";


export function bucketBusy(busy: boolean): Action {
  return {type: BUCKET_BUSY, busy};
}

export function bucketLoadSuccess(data: BucketData, permissions: BucketPermissions): Action {
  return {type: BUCKET_LOAD_SUCCESS, data, permissions};
}

export function createBucket(bid: string, data: BucketData): Action {
  return {type: BUCKET_CREATE_REQUEST, bid, data};
}

export function updateBucket(bid: string, bucketData: BucketData): Action {
  return {type: BUCKET_UPDATE_REQUEST, bid, bucketData};
}

export function deleteBucket(bid: string): Action {
  return {type: BUCKET_DELETE_REQUEST, bid};
}

export function resetBucket(): Action {
  return {type: BUCKET_RESET};
}

export function listBucketHistory(bid: string): Action {
  return {type: BUCKET_HISTORY_REQUEST, bid};
}

export function listBucketHistorySuccess(history: Object[]): Action {
  return {type: BUCKET_HISTORY_SUCCESS, history};
}

export function createCollection(bid: string, collectionData: CollectionData): Action {
  return {type: COLLECTION_CREATE_REQUEST, bid, collectionData};
}

export function updateCollection(bid: string, cid: string, collectionData: CollectionData): Action {
  return {type: COLLECTION_UPDATE_REQUEST, bid, cid, collectionData};
}

export function deleteCollection(bid: string, cid: string): Action {
  return {type: COLLECTION_DELETE_REQUEST, bid, cid};
}
