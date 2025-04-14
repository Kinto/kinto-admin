import { paginator } from "./shared";
import {
  COLLECTION_BUSY,
  COLLECTION_HISTORY_NEXT_REQUEST,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  COLLECTION_RESET,
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "@src/constants";
import type { CollectionResource, CollectionState } from "@src/types";

export const INITIAL_STATE: CollectionState = {
  busy: false,
  data: {},
  permissions: {
    read: [],
    write: [],
    "record:create": [],
  },
  currentSort: undefined,
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
