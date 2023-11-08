import type { CollectionState, CollectionResource } from "../types";

import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_NEXT_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_NEXT_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  COLLECTION_TOTAL_RECORDS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";
import { paginator } from "./shared";

const DEFAULT_SORT: string = "-last_modified";

export const INITIAL_STATE: CollectionState = {
  busy: false,
  data: {},
  permissions: {
    read: [],
    write: [],
    "record:create": [],
  },
  currentSort: DEFAULT_SORT,
  records: [],
  recordsLoaded: false,
  hasNextRecords: false,
  listNextRecords: null,
  totalRecords: undefined,
  history: paginator(undefined, { type: "@@INIT" }),
};

function load(
  state: CollectionState,
  collection: CollectionResource
): CollectionState {
  if (!collection) {
    return { ...state, busy: false };
  }
  const { data, permissions } = collection;
  return { ...state, busy: false, data, permissions };
}

export function collection(
  state: CollectionState = INITIAL_STATE,
  action: any
): CollectionState {
  switch (action.type) {
    case COLLECTION_BUSY: {
      const { busy }: { busy: boolean } = action;
      return { ...state, busy };
    }
    case ROUTE_LOAD_REQUEST: {
      return { ...INITIAL_STATE, busy: true };
    }
    case ROUTE_LOAD_SUCCESS: {
      return load(state, action.collection);
    }
    case ROUTE_LOAD_FAILURE: {
      return { ...state, busy: false };
    }
    case COLLECTION_RESET: {
      return INITIAL_STATE;
    }
    case COLLECTION_RECORDS_REQUEST: {
      const {
        currentSort,
        data: { sort: preferedSort },
      } = state;
      const { sort: newSort = preferedSort || DEFAULT_SORT } = action;
      // If a new sort filter is used, purge the previous records list and
      // pagination state.
      const records = currentSort !== newSort ? [] : state.records;
      return { ...state, currentSort: newSort, records, recordsLoaded: false };
    }
    case COLLECTION_RECORDS_NEXT_REQUEST: {
      return { ...state, recordsLoaded: false };
    }
    case COLLECTION_RECORDS_SUCCESS: {
      const { records, hasNextRecords, listNextRecords, isNextPage } = action;
      return {
        ...state,
        records: isNextPage ? [...state.records, ...records] : records,
        recordsLoaded: true,
        hasNextRecords,
        listNextRecords,
      };
    }
    case COLLECTION_TOTAL_RECORDS: {
      const { totalRecords } = action;
      return {
        ...state,
        totalRecords,
      };
    }
    case COLLECTION_HISTORY_REQUEST:
    case COLLECTION_HISTORY_NEXT_REQUEST:
    case COLLECTION_HISTORY_SUCCESS: {
      return { ...state, history: paginator(state.history, action) };
    }
    default: {
      return state;
    }
  }
}

export default collection;
