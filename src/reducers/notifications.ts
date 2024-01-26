import {
  NOTIFICATION_ADDED,
  NOTIFICATION_CLEAR,
  NOTIFICATION_REMOVED,
} from "../constants";
import type { Notification, Notifications } from "../types";

const INITIAL_STATE: Notifications = [];

export default function notifications(
  state: Notifications = INITIAL_STATE,
  action: any
): Notifications {
  switch (action.type) {
    case NOTIFICATION_ADDED: {
      const { notification }: { notification: Notification } = action;
      return [...state, notification];
    }
    case NOTIFICATION_REMOVED: {
      const { index }: { index: number } = action;
      return [...state.slice(0, index), ...state.slice(index + 1)];
    }
    case NOTIFICATION_CLEAR: {
      return INITIAL_STATE;
    }
    default: {
      return state;
    }
  }
}
