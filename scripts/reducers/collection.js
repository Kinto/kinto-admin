/* @flow */

import type { Collection, CollectionData, CollectionPermissions } from "../types";
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
export const INITIAL_STATE: Collection = {
  bucket: null,
  name: null,
  busy: false,
  schema: {},
  uiSchema: {},
  attachment: {
    enabled: false,
    required: false
  },
  displayFields: [],
  records: [],
  recordsLoaded: false,
  hasNextRecords: false,
  listNextRecords: null,
  sort: DEFAULT_SORT,
  permissions: {
    "read": [],
    "write": [],
    "record:create": [],
  },
  history: [],
  historyLoaded: false,
};

export function collection(
  state: Collection = INITIAL_STATE,
  action: Object
): Collection {
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
      const {
        bucket,
        id,
        schema,
        uiSchema,
        attachment,
        displayFields,
        sort = DEFAULT_SORT,
      } = data;
      const {read=[], write=[]} = permissions;
      return {
        ...state,
        busy: false,
        name: id,
        bucket,
        schema,
        uiSchema,
        attachment,
        displayFields,
        sort,
        permissions: {read, write}
      };
    }
    case COLLECTION_RECORDS_REQUEST: {
      // If a new sort filter is used, purge the previous records list and
      // pagination state.
      const records = state.sort !== action.sort ? [] : state.records;
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
