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
      const {properties} = action;
      return {
        ...state,
        bucket: properties.bucket,
        name: properties.id,
        label: properties.label,
        schema: properties.schema,
        uiSchema: properties.uiSchema,
        displayFields: properties.displayFields,
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
