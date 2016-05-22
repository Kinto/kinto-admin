import {
  CLIENT_BUSY,
  SESSION_LIST_BUCKETS_REQUEST,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
  COLLECTION_LOAD_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../constants";


export function clientBusy(busy) {
  return {
    type: CLIENT_BUSY,
    busy,
  };
}

export function listBuckets() {
  return {type: SESSION_LIST_BUCKETS_REQUEST};
}

export function loadCollection(bid, cid) {
  return {type: COLLECTION_LOAD_REQUEST, bid, cid};
}

export function createCollection(bid, collectionData) {
  return {type: COLLECTION_CREATE_REQUEST, bid, collectionData};
}

export function updateCollection(bid, cid, collectionData) {
  return {type: COLLECTION_UPDATE_REQUEST, bid, cid, collectionData};
}

export function deleteCollection(bid, cid) {
  return {type: COLLECTION_DELETE_REQUEST, bid, cid};
}

export function listRecords(bid, cid) {
  return {type: COLLECTION_RECORDS_REQUEST, bid, cid};
}

export function loadRecord(bid, cid, rid) {
  return {type: RECORD_LOAD_REQUEST, bid, cid, rid};
}

export function createRecord(bid, cid, record) {
  return {type: RECORD_CREATE_REQUEST, bid, cid, record};
}

export function updateRecord(bid, cid, rid, record) {
  return {type: RECORD_UPDATE_REQUEST, bid, cid, rid, record};
}

export function deleteRecord(bid, cid, rid) {
  return {type: RECORD_DELETE_REQUEST, bid, cid, rid};
}

export function bulkCreateRecords(bid, cid, records) {
  return {type: RECORD_BULK_CREATE_REQUEST, bid, cid, records};
}
