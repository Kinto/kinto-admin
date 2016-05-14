import {
  CLIENT_BUSY,
  CLIENT_COLLECTION_PROPERTIES_LOADED,
  CLIENT_COLLECTION_RECORDS_LOADED,
} from "../actions/client";
import {
  COLLECTION_RESET,
} from "../actions/collection";


const INITIAL_STATE = {
  bucket: "default",
  name: null,
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
      return {...INITIAL_STATE};
    }
    case CLIENT_COLLECTION_PROPERTIES_LOADED: {
      const {properties} = action;
      return {
        ...state,
        bucket: properties.bucket,
        name: properties.id,
        schema: properties.schema,
        uiSchema: properties.uiSchema,
        displayFields: properties.displayFields,
      };
    }
    case CLIENT_COLLECTION_RECORDS_LOADED: {
      return {...state, records: action.records};
    }
    default: {
      return state;
    }
  }
}

export default collection;
