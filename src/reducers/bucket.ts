import { paginator } from "./shared";
import {
  BUCKET_BUSY,
  BUCKET_COLLECTIONS_NEXT_REQUEST,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_NEXT_REQUEST,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  BUCKET_RESET,
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "@src/constants";
import type { BucketResource, BucketState, GroupData } from "@src/types";

const INITIAL_STATE: BucketState = {
  busy: false,
  data: {},
  permissions: {
    read: [],
    write: [],
    "collection:create": [],
    "group:create": [],
  },
  groups: [],
  collections: paginator(undefined, { type: "@@INIT" }),
  history: paginator(undefined, { type: "@@INIT" }),
};

function load(
  state: BucketState,
  bucket: BucketResource,
  groups: GroupData[]
): BucketState {
  if (!bucket) {
    return { ...state, busy: false };
  }
  const { data, permissions } = bucket;
  return { ...state, busy: false, data, permissions, groups };
}

export function bucket(state: BucketState = INITIAL_STATE, action: any) {
  switch (action.type) {
    case BUCKET_BUSY: {
      const { busy }: { busy: boolean } = action;
      return { ...state, busy };
    }
    case ROUTE_LOAD_REQUEST: {
      return { ...INITIAL_STATE, busy: true };
    }
    case ROUTE_LOAD_SUCCESS: {
      const { bucket, groups = state.groups } = action;
      return load(state, bucket, groups);
    }
    case ROUTE_LOAD_FAILURE: {
      return { ...state, busy: false };
    }
    case BUCKET_COLLECTIONS_REQUEST:
    case BUCKET_COLLECTIONS_NEXT_REQUEST:
    case BUCKET_COLLECTIONS_SUCCESS: {
      return { ...state, collections: paginator(state.collections, action) };
    }
    case BUCKET_HISTORY_REQUEST:
    case BUCKET_HISTORY_NEXT_REQUEST:
    case BUCKET_HISTORY_SUCCESS: {
      return { ...state, history: paginator(state.history, action) };
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
