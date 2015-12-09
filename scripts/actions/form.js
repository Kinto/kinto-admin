import { update } from "./collection";

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
    dispatch(update(Object.assign({}, record, formData)));
  };
}
