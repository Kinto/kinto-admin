import {
  CONFLICTS_REPORTED,
} from "../actions/conflicts";

const INITIAL_STATE = {};

export default function collections(state = INITIAL_STATE, action) {
  switch(action.type) {
  case CONFLICTS_REPORTED: {
    return action.conflicts.reduce((acc, conflict) =>  {
      acc[conflict.local.id] = conflict;
      return acc;
    }, {});
  }
  default:
    return state;
  }
}
