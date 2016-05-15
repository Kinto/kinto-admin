export const RECORD_LOADED = "RECORD_LOADED";
export const RECORD_RESET = "RECORD_RESET";


export function resetRecord() {
  return {
    type: RECORD_RESET,
  };
}

export function recordLoaded(record) {
  return {
    type: RECORD_LOADED,
    record,
  };
}
