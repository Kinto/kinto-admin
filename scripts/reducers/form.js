import { cleanRecord } from "kinto/lib/api";

import {
  FORM_RECORD_LOADED,
  FORM_RECORD_UNLOADED,
  FORM_DATA_RECEIVED,
} from "../actions/form";

const INITIAL_STATE = {
  record: null,
  formData: null,
};

export default function form(state = INITIAL_STATE, action) {
  switch (action.type) {
  case FORM_RECORD_LOADED:
    return {
      ...state,
      record: action.record,
      formData: cleanRecord(action.record, ["id", "_status", "last_modified"]),
    };
  case FORM_RECORD_UNLOADED:
    return {...state, record: null, formData: null};
  case FORM_DATA_RECEIVED:
    return {...state, formData: action.formData};
  default:
    return state;
  }
}
