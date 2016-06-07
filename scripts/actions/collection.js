import {
  ATTACHMENT_DELETE_REQUEST,
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../constants";


export function collectionBusy(busy) {
  return {type: COLLECTION_BUSY, busy};
}

export function resetCollection() {
  return {type: COLLECTION_RESET};
}

export function collectionLoadSuccess(data, permissions) {
  return {type: COLLECTION_LOAD_SUCCESS, data, permissions};
}

export function listRecordsSuccess(records) {
  return {type: COLLECTION_RECORDS_SUCCESS, records};
}

export function listRecords(bid, cid) {
  return {type: COLLECTION_RECORDS_REQUEST, bid, cid};
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

export function deleteAttachment(bid, cid, rid) {
  return {type: ATTACHMENT_DELETE_REQUEST, bid, cid, rid};
}

export function bulkCreateRecords(bid, cid, records) {
  return {type: RECORD_BULK_CREATE_REQUEST, bid, cid, records};
}
