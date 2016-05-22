import {
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_CREATED,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_RECORD_CREATED,
} from "../constants";


export function reset() {
  return {type: COLLECTION_RESET};
}

export function collectionCreated(data) {
  return {type: COLLECTION_CREATED, data};
}

export function collectionLoadSuccess(properties) {
  return {type: COLLECTION_LOAD_SUCCESS, properties};
}

export function collectionRecordsSuccess(records) {
  return {type: COLLECTION_RECORDS_SUCCESS, records};
}

export function collectionRecordCreated(data) {
  return {type: COLLECTION_RECORD_CREATED, data};
}
