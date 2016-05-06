import { cleanRecord } from "kinto/lib/collection";
import {
  CONFLICTS_REPORTED,
  CONFLICT_RESOLVED,
} from "../actions/conflicts";

const INITIAL_STATE = {};

export default function collections(state = INITIAL_STATE, action) {
  switch(action.type) {
  case CONFLICTS_REPORTED: {
    return action.conflicts.reduce((acc, conflict) =>  {
      acc[conflict.local.id] = Object.assign({}, conflict, {
        local: cleanRecord(conflict.local, ["_status"])
      });
      return acc;
    }, {});
  }
  case CONFLICT_RESOLVED: {
    return Object.keys(state).reduce((acc, id) => {
      return id !== action.id ? Object.assign({}, acc, {[id]: state[id]}) : acc;
    }, {});
  }
  default:
    return state;
  }
}
