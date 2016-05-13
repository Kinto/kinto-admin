import {
  CLIENT_COLLECTION_PROPERTIES_LOADED,
  CLIENT_COLLECTION_RECORDS_LOADED,
} from "../actions/client";
import {
  COLLECTION_BUSY,
  COLLECTION_LOADED,
  COLLECTION_READY,
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
    case COLLECTION_RESET: {
      return {...INITIAL_STATE};
    }
    case CLIENT_COLLECTION_PROPERTIES_LOADED: {
      const {properties} = action;
      return {
        ...state,
        busy: false,
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
    /* Obsolete, to be removed*/
    case COLLECTION_READY: {
      return {
        ...state,
        name: action.name,
        schema: action.schema,
        uiSchema: action.uiSchema,
        config: action.config,
        message: null,
      };
    }
    case COLLECTION_BUSY: {
      return {...state, busy: action.flag};
    }
    case COLLECTION_LOADED: {
      return {...state, busy: false, records: action.records};
    }
    default: {
      return state;
    }
  }
}

export default collection;
