/* @flow */

import type { CollectionState, CollectionResource } from "../types";

import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_NEXT_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";


const DEFAULT_SORT: string = "-last_modified";

export const INITIAL_STATE: CollectionState = {
  id: null,
  busy: false,
  data: {
    schema: {},
    uiSchema: {},
    attachment: {
      enabled: false,
      required: false
    },
    displayFields: [],
    sort: DEFAULT_SORT,
  },
  permissions: {
    "read": [],
    "write": [],
    "record:create": [],
  },
  currentSort: DEFAULT_SORT,
  records: [],
  recordsLoaded: false,
  hasNextRecords: false,
  listNextRecords: null,
  history: [],
  historyLoaded: false,
};

function load(state: CollectionState, collection: CollectionResource): CollectionState {
  if (!collection) {
    return {...state, busy: false};
  }
  const {data, permissions} = collection;
  const {id} = data;
  return {
    ...state,
    busy: false,
    id,
    data: {...INITIAL_STATE.data, ...data},
    permissions,
  };
}

export function collection(
  state: CollectionState = INITIAL_STATE,
  action: Object
): CollectionState {
  switch (action.type) {
    case COLLECTION_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case ROUTE_LOAD_REQUEST: {
      return {...INITIAL_STATE, busy: true};
    }
    case ROUTE_LOAD_SUCCESS: {
      return load(state, action.collection);
    }
    case ROUTE_LOAD_FAILURE: {
      return {...state, busy: false};
    }
    case COLLECTION_RESET: {
      return INITIAL_STATE;
    }
    case COLLECTION_RECORDS_REQUEST: {
      const {currentSort, data: {sort: preferedSort}} = state;
      const {sort: newSort = preferedSort || DEFAULT_SORT} = action;
      // If a new sort filter is used, purge the previous records list and
      // pagination state.
      const records = currentSort !== newSort ? [] : state.records;
      return {...state, currentSort: newSort, records, recordsLoaded: false};
    }
    case COLLECTION_RECORDS_NEXT_REQUEST: {
      return {...state, recordsLoaded: false};
    }
    case COLLECTION_RECORDS_SUCCESS: {
      const {records, hasNextRecords, listNextRecords} = action;
      return {
        ...state,
        records: [...state.records, ...records],
        recordsLoaded: true,
        hasNextRecords,
        listNextRecords,
      };
    }
    case COLLECTION_HISTORY_REQUEST: {
      return {...state, historyLoaded: false};
    }
    case COLLECTION_HISTORY_SUCCESS: {
      return {...state, history: action.history, historyLoaded: true};
    }
    default: {
      return state;
    }
  }
}

export default collection;
