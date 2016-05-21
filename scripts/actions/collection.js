import {
  COLLECTION_RESET,
  COLLECTION_PROPERTIES_LOADED,
  COLLECTION_CREATED,
  COLLECTION_DELETED,
  COLLECTION_RECORDS_LOADED,
  COLLECTION_RECORD_CREATED,
} from "../constants";


export function reset() {
  return {type: COLLECTION_RESET};
}

export function collectionCreated(data) {
  return {type: COLLECTION_CREATED, data};
}

export function collectionPropertiesLoaded(properties) {
  return {type: COLLECTION_PROPERTIES_LOADED, properties};
}

export function collectionRecordsLoaded(records) {
  return {type: COLLECTION_RECORDS_LOADED, records};
}

export function collectionDeleted(data) {
  return {type: COLLECTION_DELETED, data};
}

export function collectionRecordCreated(data) {
  return {type: COLLECTION_RECORD_CREATED, data};
}
