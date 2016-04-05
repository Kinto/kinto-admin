import {
  COLLECTION_SYNCED,
  COLLECTIONS_LIST_RECEIVED
} from "../actions/collections";

const INITIAL_STATE = {};

export default function collections(state = INITIAL_STATE, action) {
  switch(action.type) {
  case COLLECTION_SYNCED: {
    // Update the synced status for the provided collection name
    const collectionState = {
      ...state[action.name],
      ...{synced: action.synced}
    };
    return {
      ...state,
      [action.name]: collectionState
    };
  }
  case COLLECTIONS_LIST_RECEIVED:
    return action.collections;
  default:
    return state;
  }
}
