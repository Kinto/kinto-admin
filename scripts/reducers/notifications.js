import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";


const INITIAL_STATE = [];

export default function notifications(state = INITIAL_STATE, action) {
  switch(action.type) {
    case NOTIFICATION_ADDED: {
      return [...state, action.notification];
    }
    case NOTIFICATION_REMOVED: {
      return [...state.slice(0, action.index),
              ...state.slice(action.index + 1)];
    }
    case NOTIFICATION_CLEAR: {
      const {force} = action;
      return force ? INITIAL_STATE : state.filter(notif => notif.persistent);
    }
    default: {
      return state;
    }
  }
}
