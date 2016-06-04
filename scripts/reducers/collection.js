import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_RECORDS_SUCCESS,
} from "../constants";


const INITIAL_STATE = {
  bucket: null,
  name: null,
  label: null,
  busy: false,
  schema: {},
  uiSchema: {},
  attachment: {enabled: false, required: false},
  displayFields: [],
  records: [],
  recordsLoaded: false,
};

export function collection(state = INITIAL_STATE, action) {
  switch (action.type) {
    case COLLECTION_BUSY: {
      return {...state, busy: action.busy};
    }
    case COLLECTION_RESET: {
      return INITIAL_STATE;
    }
    case COLLECTION_LOAD_SUCCESS: {
      const {data} = action;
      const {bucket, id, schema, uiSchema, attachment, displayFields} = data;
      return {
        ...state,
        name: id,
        label: `${bucket}/${id}`,
        bucket,
        schema,
        uiSchema,
        attachment,
        displayFields,
      };
    }
    case COLLECTION_RECORDS_SUCCESS: {
      return {...state, records: action.records, recordsLoaded: true};
    }
    default: {
      return state;
    }
  }
}

export default collection;
