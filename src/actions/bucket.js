/* @flow */

import type {
  BucketData,
  BucketResource,
  CollectionData,
  CollectionResource,
  GroupData,
  GroupResource,
  HistoryFilters,
  ResourceHistoryEntry,
} from "../types";

import {
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_NEXT_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_NEXT_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  BUCKET_CREATE_REQUEST,
  BUCKET_UPDATE_REQUEST,
  BUCKET_DELETE_REQUEST,
  BUCKET_RESET,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
  GROUP_CREATE_REQUEST,
  GROUP_UPDATE_REQUEST,
  GROUP_DELETE_REQUEST,
} from "../constants";

export function createBucket(
  bid: string,
  data: BucketData
): {
  type: "BUCKET_CREATE_REQUEST",
  bid: string,
  data: BucketData,
} {
  return { type: BUCKET_CREATE_REQUEST, bid, data };
}

export function updateBucket(
  bid: string,
  bucket: BucketResource
): {
  type: "BUCKET_UPDATE_REQUEST",
  bid: string,
  bucket: BucketResource,
} {
  return { type: BUCKET_UPDATE_REQUEST, bid, bucket };
}

export function deleteBucket(
  bid: string
): {
  type: "BUCKET_DELETE_REQUEST",
  bid: string,
} {
  return { type: BUCKET_DELETE_REQUEST, bid };
}

export function resetBucket(): { type: "BUCKET_RESET" } {
  return { type: BUCKET_RESET };
}

export function listBucketCollections(
  bid: string
): {
  type: "BUCKET_COLLECTIONS_REQUEST",
  bid: string,
} {
  return { type: BUCKET_COLLECTIONS_REQUEST, bid };
}

export function listBucketNextCollections(): {
  type: "BUCKET_COLLECTIONS_NEXT_REQUEST",
} {
  return { type: BUCKET_COLLECTIONS_NEXT_REQUEST };
}

export function listBucketCollectionsSuccess(
  entries: CollectionData[],
  hasNextPage: boolean,
  next: ?Function
): {
  type: "BUCKET_COLLECTIONS_SUCCESS",
  entries: CollectionData[],
  hasNextPage: boolean,
  next: ?Function,
} {
  return { type: BUCKET_COLLECTIONS_SUCCESS, entries, hasNextPage, next };
}

export function listBucketHistory(
  bid: string,
  filters: HistoryFilters = {}
): {
  type: "BUCKET_HISTORY_REQUEST",
  bid: string,
  filters: HistoryFilters,
} {
  return { type: BUCKET_HISTORY_REQUEST, bid, filters };
}

export function listBucketNextHistory(): {
  type: "BUCKET_HISTORY_NEXT_REQUEST",
} {
  return { type: BUCKET_HISTORY_NEXT_REQUEST };
}

export function listBucketHistorySuccess(
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: ?Function
): {
  type: "BUCKET_HISTORY_SUCCESS",
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: ?Function,
} {
  return { type: BUCKET_HISTORY_SUCCESS, entries, hasNextPage, next };
}

export function createCollection(
  bid: string,
  collectionData: CollectionData
): {
  type: "COLLECTION_CREATE_REQUEST",
  bid: string,
  collectionData: CollectionData,
} {
  return { type: COLLECTION_CREATE_REQUEST, bid, collectionData };
}

export function updateCollection(
  bid: string,
  cid: string,
  collection: CollectionResource
): {
  type: "COLLECTION_UPDATE_REQUEST",
  bid: string,
  cid: string,
  collection: CollectionResource,
} {
  return { type: COLLECTION_UPDATE_REQUEST, bid, cid, collection };
}

export function deleteCollection(
  bid: string,
  cid: string
): {
  type: "COLLECTION_DELETE_REQUEST",
  bid: string,
  cid: string,
} {
  return { type: COLLECTION_DELETE_REQUEST, bid, cid };
}

export function createGroup(
  bid: string,
  groupData: GroupData
): {
  type: "GROUP_CREATE_REQUEST",
  bid: string,
  groupData: GroupData,
} {
  return { type: GROUP_CREATE_REQUEST, bid, groupData };
}

export function updateGroup(
  bid: string,
  gid: string,
  group: GroupResource
): {
  type: "GROUP_UPDATE_REQUEST",
  bid: string,
  gid: string,
  group: GroupResource,
} {
  return { type: GROUP_UPDATE_REQUEST, bid, gid, group };
}

export function deleteGroup(
  bid: string,
  gid: string
): {
  type: "GROUP_DELETE_REQUEST",
  bid: string,
  gid: string,
} {
  return { type: GROUP_DELETE_REQUEST, bid, gid };
}
