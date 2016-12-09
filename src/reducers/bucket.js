/* @flow */

import type { BucketState, BucketResource, GroupData } from "../types";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";


const INITIAL_STATE: BucketState = {
  busy: false,
  data: {},
  permissions: {
    "read": [],
    "write": [],
    "collection:create": [],
    "group:create": [],
  },
  groups: [],
  collections: [],
  collectionsLoaded: false,
  history: {
    entries: [],
    loaded: false,
    hasNextPage: false,
    next: null,
  }
};

function load(state: BucketState, bucket: BucketResource, groups: GroupData[]): BucketState {
  if (!bucket) {
    return {...state, busy: false};
  }
  const {data, permissions} = bucket;
  return {...state, busy: false, data, permissions, groups};
}

export function bucket(state: BucketState = INITIAL_STATE, action: Object) {
  switch (action.type) {
    case BUCKET_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case ROUTE_LOAD_REQUEST: {
      return {...INITIAL_STATE, busy: true};
    }
    case ROUTE_LOAD_SUCCESS: {
      const {bucket, groups=state.groups} = action;
      return load(state, bucket, groups);
    }
    case ROUTE_LOAD_FAILURE: {
      return {...state, busy: false};
    }
    case BUCKET_COLLECTIONS_REQUEST: {
      return {...state, collectionsLoaded: false};
    }
    case BUCKET_COLLECTIONS_SUCCESS: {
      const {collections} = action;
      return {...state, collections, collectionsLoaded: true};
    }
    case BUCKET_HISTORY_REQUEST: {
      return {...state, historyLoaded: false};
    }
    case BUCKET_HISTORY_SUCCESS: {
      const {entries, hasNextPage, next} = action;
      return {
        ...state,
        history: {
          entries: [...state.history.entries, ...entries],
          loaded: true,
          hasNextPage,
          next,
        }
      };
    }
    case BUCKET_RESET: {
      return INITIAL_STATE;
    }
    default: {
      return state;
    }
  }
}

export default bucket;
