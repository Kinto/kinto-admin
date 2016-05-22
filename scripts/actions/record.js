import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../constants";


export function resetRecord() {
  return {type: RECORD_RESET};
}

export function recordLoaded(record) {
  return {type: RECORD_LOAD_SUCCESS, record};
}
