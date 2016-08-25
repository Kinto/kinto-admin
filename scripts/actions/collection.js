/* @flow */

import type {
  Action,
  CollectionData,
  CollectionPermissions,
  RecordData,
} from "../types";

import {
  ATTACHMENT_DELETE_REQUEST,
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_NEXT_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../constants";


export function collectionBusy(busy: boolean): Action {
  return {type: COLLECTION_BUSY, busy};
}

export function resetCollection(): Action {
  return {type: COLLECTION_RESET};
}

export function collectionLoadSuccess(
  data: CollectionData,
  permissions: CollectionPermissions
): Action {
  return {type: COLLECTION_LOAD_SUCCESS, data, permissions};
}

export function listRecords(bid: string, cid: string, sort: string): Action {
  return {type: COLLECTION_RECORDS_REQUEST, bid, cid, sort};
}

export function listNextRecords(): Action {
  return {type: COLLECTION_RECORDS_NEXT_REQUEST};
}

export function listRecordsSuccess(
  records: RecordData[],
  hasNextRecords: boolean,
  listNextRecords: ?Function
): Action {
  return {type: COLLECTION_RECORDS_SUCCESS, records, hasNextRecords, listNextRecords};
}

export function listCollectionHistory(bid: string, cid: string): Action {
  return {type: COLLECTION_HISTORY_REQUEST, bid, cid};
}

export function listCollectionHistorySuccess(history: Object[]): Action {
  return {type: COLLECTION_HISTORY_SUCCESS, history};
}

export function createRecord(bid: string, cid: string, record: RecordData, attachment?: String): Action {
  return {type: RECORD_CREATE_REQUEST, bid, cid, record, attachment};
}

export function updateRecord(bid: string, cid: string, rid: string, record: RecordData, attachment?: String): Action {
  return {type: RECORD_UPDATE_REQUEST, bid, cid, rid, record, attachment};
}

export function deleteRecord(bid: string, cid: string, rid: string): Action {
  return {type: RECORD_DELETE_REQUEST, bid, cid, rid};
}

export function deleteAttachment(bid: string, cid: string, rid: string): Action {
  return {type: ATTACHMENT_DELETE_REQUEST, bid, cid, rid};
}

export function bulkCreateRecords(bid: string, cid: string, records: RecordData[]): Action {
  return {type: RECORD_BULK_CREATE_REQUEST, bid, cid, records};
}
