import {
  BUCKET_COLLECTIONS_NEXT_REQUEST,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_NEXT_REQUEST,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  COLLECTION_HISTORY_NEXT_REQUEST,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  GROUP_HISTORY_NEXT_REQUEST,
  GROUP_HISTORY_REQUEST,
  GROUP_HISTORY_SUCCESS,
  RECORD_HISTORY_NEXT_REQUEST,
  RECORD_HISTORY_REQUEST,
  RECORD_HISTORY_SUCCESS,
} from "@src/constants";
import type { Paginator } from "@src/types";

const INITIAL_STATE: Paginator<any> = {
  entries: [],
  loaded: false,
  hasNextPage: false,
  next: null,
};

export function paginator(
  state: Paginator<any> = INITIAL_STATE,
  action: any
): Paginator<any> {
  switch (action.type) {
    case BUCKET_COLLECTIONS_REQUEST:
    case BUCKET_COLLECTIONS_NEXT_REQUEST:
    case BUCKET_HISTORY_REQUEST:
    case BUCKET_HISTORY_NEXT_REQUEST:
    case GROUP_HISTORY_REQUEST:
    case GROUP_HISTORY_NEXT_REQUEST:
    case COLLECTION_HISTORY_REQUEST:
    case COLLECTION_HISTORY_NEXT_REQUEST:
    case RECORD_HISTORY_REQUEST:
    case RECORD_HISTORY_NEXT_REQUEST: {
      return { ...state, loaded: false };
    }
    // history responses
    case BUCKET_COLLECTIONS_SUCCESS:
    case BUCKET_HISTORY_SUCCESS:
    case GROUP_HISTORY_SUCCESS:
    case COLLECTION_HISTORY_SUCCESS:
    case RECORD_HISTORY_SUCCESS: {
      const { entries, hasNextPage, next } = action;
      return {
        entries: [...state.entries, ...entries],
        loaded: true,
        hasNextPage,
        next,
      };
    }
    default: {
      return state;
    }
  }
}
