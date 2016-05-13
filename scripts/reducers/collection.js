import {
  COLLECTION_BUSY,
  COLLECTION_LOADED,
  COLLECTION_READY,
  COLLECTION_PROPERTIES_LOADED,
} from "../actions/collection";

const INITIAL_STATE = {
  name: null,
  busy: false,
  schema: {},
  uiSchema: {},
  displayFields: [],
  records: [],
};

export function collection(state = INITIAL_STATE, action) {
  switch (action.type) {
    case COLLECTION_PROPERTIES_LOADED: {
      return {
        ...state,
        busy: false,
        schema: action.schema,
        uiSchema: action.uiSchema,
        displayFields: action.displayFields,
      };
    }
    case COLLECTION_READY:
      return {
        ...state,
        name: action.name,
        schema: action.schema,
        uiSchema: action.uiSchema,
        config: action.config,
        message: null,
      };
    case COLLECTION_BUSY:
      return {...state, busy: action.flag};
    case COLLECTION_LOADED:
      return {...state, busy: false, records: action.records};
    default:
      return state;
  }
}

export default collection;
