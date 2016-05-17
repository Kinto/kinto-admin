import {
  RECORD_LOADED,
  RECORD_RESET,
} from "../constants";


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
