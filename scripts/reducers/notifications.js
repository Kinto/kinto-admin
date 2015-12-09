import { UPDATE_PATH } from "redux-simple-router";
import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../actions/notifications";

const INITIAL_STATE = [];

export default function notifications(state = INITIAL_STATE, action) {
  switch(action.type) {
  case NOTIFICATION_ADDED:
    return [...state, action.notification];
  case NOTIFICATION_REMOVED:
    return [...state.slice(0, action.index),
            ...state.slice(action.index + 1)];
  case UPDATE_PATH: // clear on url change
  case NOTIFICATION_CLEAR:
    return INITIAL_STATE;
  default:
    return state;
  }
}
