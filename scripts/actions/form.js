import { cleanRecord } from "kinto/lib/collection";

import { update } from "./collection";
import { FORMDATA_IGNORE_FIELDS } from "../reducers/form";


export const FORM_RECORD_LOADED = "FORM_RECORD_LOADED";
export const FORM_RECORD_UNLOADED = "FORM_RECORD_UNLOADED";
export const FORM_DATA_RECEIVED = "FORM_DATA_RECEIVED";

export function recordLoaded(record) {
  return {type: FORM_RECORD_LOADED, record};
}

export function unloadRecord(record) {
  return {type: FORM_RECORD_UNLOADED};
}

export function formDataReceived(formData) {
  return {type: FORM_DATA_RECEIVED, formData};
}

export function submitForm() {
  return (dispatch, getState) => {
    const {record, formData} = getState().form;
    const cleanFormData = cleanRecord(formData, FORMDATA_IGNORE_FIELDS);
    dispatch(update(Object.assign({}, record, cleanFormData)));
  };
}
