/* @flow */

import type { BucketState, BucketData, BucketPermissions } from "../types";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_LOAD_SUCCESS,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_GROUPS_REQUEST,
  BUCKET_GROUPS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
} from "../constants";
import { omit } from "../utils";


const INITIAL_STATE: BucketState = {
  busy: false,
  name: null,
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

export function bucket(state: BucketState = INITIAL_STATE, action: Object) {
  switch (action.type) {
    case BUCKET_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case BUCKET_LOAD_SUCCESS: {
      const {data, permissions}: {
        data: BucketData,
        permissions: BucketPermissions,
      } = action;
      return {
        ...state,
        data: omit(data, ["id", "last_modified"]),
        name: data.id,
        permissions: {
          read: permissions.read,
          write: permissions.write,
        },
      };
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
