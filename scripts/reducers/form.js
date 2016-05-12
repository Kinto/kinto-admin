import { cleanRecord } from "kinto/lib/collection";

import {
  FORM_RECORD_LOADED,
  FORM_RECORD_UNLOADED,
  FORM_DATA_RECEIVED,
} from "../actions/form";

export const FORMDATA_IGNORE_FIELDS = ["id", "_status", "last_modified"];

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
        formData: cleanRecord(action.record, FORMDATA_IGNORE_FIELDS),
      };
    case FORM_RECORD_UNLOADED:
      return {...state, record: null, formData: null};
    case FORM_DATA_RECEIVED:
      return {...state, formData: action.formData};
    default:
      return state;
  }
}
