/* @flow */

import type { BucketState, BucketResource } from "../types";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_GROUPS_REQUEST,
  BUCKET_GROUPS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";
import { omit } from "../utils";


const INITIAL_STATE: BucketState = {
  busy: false,
  id: null,
  last_modified: null,
  data: {},
  groups: [],
  groupsLoaded: false,
  collections: [],
  collectionsLoaded: false,
  history: [],
  historyLoaded: false,
  permissions: {
    "read": [],
    "write": [],
    "collection:create": [],
    "group:create": [],
  },
};

function load(state: BucketState, bucket: BucketResource): BucketState {
  if (!bucket) {
    return {...state, busy: false};
  }
  const {data, permissions} = bucket;
  const {id, last_modified} = data;
  return {
    ...state,
    busy: false,
    id,
    last_modified,
    data: omit(data, ["id", "last_modified"]),
    permissions,
  };
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
      return load(state, action.bucket);
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
    case BUCKET_GROUPS_REQUEST: {
      return {...state, groupsLoaded: false};
    }
    case BUCKET_GROUPS_SUCCESS: {
      const {groups} = action;
      return {...state, groups, groupsLoaded: true};
    }
    case BUCKET_HISTORY_REQUEST: {
      return {...state, historyLoaded: false};
    }
    case BUCKET_HISTORY_SUCCESS: {
      return {...state, history: action.history, historyLoaded: true};
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
