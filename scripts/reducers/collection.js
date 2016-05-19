import {
  CLIENT_BUSY,
  COLLECTION_RESET,
  COLLECTION_PROPERTIES_LOADED,
  COLLECTION_RECORDS_LOADED,
  COLLECTION_CREATED,
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
    case CLIENT_BUSY: {
      return {...state, busy: action.busy};
    }
    case COLLECTION_RESET: {
      return INITIAL_STATE;
    }
    case COLLECTION_PROPERTIES_LOADED: {
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
    case COLLECTION_RECORDS_LOADED: {
      return {...state, records: action.records};
    }
    case COLLECTION_CREATED: {
      // XXX load created collection data?
      return state;
    }
    default: {
      return state;
    }
  }
}

export default collection;
