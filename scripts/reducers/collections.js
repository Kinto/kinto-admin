import INITIAL_STATE from "../../config/kwac-config.json";
import { COLLECTION_SYNCED } from "../actions/collections";

export default function collections(state = INITIAL_STATE, action) {
  switch(action.type) {
  case COLLECTION_SYNCED:
    // Update the synced status for the provided collection name
    const collectionState = {
      ...state[action.name],
      ...{synced: action.synced}
    };
    return {
      ...state,
      [action.name]: collectionState
    };
  default:
    return state;
  }
}
