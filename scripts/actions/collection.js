export const COLLECTION_RESET = "COLLECTION_RESET";


export function reset() {
  return {type: COLLECTION_RESET};
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
