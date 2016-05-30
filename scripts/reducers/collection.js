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
  displayFields: [],
  records: [],
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
      const {bucket, id, schema, uiSchema, displayFields} = data;
      return {
        ...state,
        name: id,
        label: `${bucket}/${id}`,
        bucket,
        schema,
        uiSchema,
        displayFields,
      };
    }
    case COLLECTION_RECORDS_SUCCESS: {
      return {...state, records: action.records};
    }
    default: {
      return state;
    }
  }
}

export default collection;
