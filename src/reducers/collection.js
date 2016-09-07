/* @flow */

import type { CollectionState, CollectionData, CollectionPermissions } from "../types";

import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_NEXT_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
} from "../constants";


const DEFAULT_SORT: string = "-last_modified";

export const INITIAL_STATE: CollectionState = {
  name: null,
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
  records: [],
  recordsLoaded: false,
  hasNextRecords: false,
  listNextRecords: null,
  history: [],
  historyLoaded: false,
};

export function collection(
  state: CollectionState = INITIAL_STATE,
  action: Object
): CollectionState {
  switch (action.type) {
    case COLLECTION_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case COLLECTION_RESET: {
      return INITIAL_STATE;
    }
    case COLLECTION_LOAD_SUCCESS: {
      const {data, permissions}: {
        data: CollectionData,
        permissions: CollectionPermissions,
      } = action;
      const {read=[], write=[]} = permissions;
      return {
        ...state,
        busy: false,
        name: data.id,
        data: {...INITIAL_STATE.data, ...data},
        permissions: {read, write}
      };
    }
    case COLLECTION_RECORDS_REQUEST: {
      const {data: {sort: currentSort}} = state;
      // If a new sort filter is used, purge the previous records list and
      // pagination state.
      const records = currentSort !== action.sort ? [] : state.records;
      return {...state, sort: action.sort, records, recordsLoaded: false};
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
