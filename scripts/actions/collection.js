import {
  COLLECTION_RESET,
  COLLECTION_PROPERTIES_LOADED,
  COLLECTION_CREATED,
  COLLECTION_DELETED,
  COLLECTION_RECORDS_LOADED,
  COLLECTION_RECORD_CREATED,
} from "../constants";


export function reset() {
  return {
    type: COLLECTION_RESET
  };
}

export function collectionCreated(data) {
  return {
    type: COLLECTION_CREATED,
    data,
  };
}

export function collectionPropertiesLoaded(properties) {
  return {
    type: COLLECTION_PROPERTIES_LOADED,
    properties,
  };
}

export function collectionRecordsLoaded(records) {
  return {
    type: COLLECTION_RECORDS_LOADED,
    records,
  };
}

export function collectionDeleted(cid) {
  return {
    type: COLLECTION_DELETED,
    cid,
  };
}

export function collectionRecordCreated(data) {
  return {
    type: COLLECTION_RECORD_CREATED,
    data,
  };
}

// XXX left here this may be reused later
export function formatSyncErrorDetails(syncResult) {
  let details = [];
  if (syncResult.errors.length > 0) {
    details = details.concat(syncResult.errors.map(_error => {
      var _message;
      if (_error.type === "outgoing") {
        const {error, message, code, errno} = _error.error;
        _message = `errno ${errno}, ${message}: ${code} ${error}`;
      } else {
        _message = _error.message;
      }
      return `${_error.type} error: ${_message}`;
    }));
  }
  if (syncResult.conflicts.length > 0) {
    details = details.concat(syncResult.conflicts.map(conflict => {
      return `${conflict.type} conflict: ${conflict.remote.id}`;
    }));
  }
  return details;
}
