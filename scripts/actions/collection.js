import {
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_CREATED,
  COLLECTION_RECORDS_LOADED,
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

export function collectionRecordsLoaded(records) {
  return {type: COLLECTION_RECORDS_LOADED, records};
}

export function collectionRecordCreated(data) {
  return {type: COLLECTION_RECORD_CREATED, data};
}
