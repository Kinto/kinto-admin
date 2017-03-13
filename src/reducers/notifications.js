/* @flow */

import type { Notifications, Notification } from "../types";
import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";

const INITIAL_STATE: Notifications = [];

export default function notifications(
  state: Notifications = INITIAL_STATE,
  action: Object
): Notifications {
  switch (action.type) {
    case NOTIFICATION_ADDED: {
      const {
        clear,
        notification,
      }: {
        clear: boolean,
        notification: Notification,
      } = action;
      if (clear) {
        return [notification];
      } else {
        return [...state, notification];
      }
    }
    case NOTIFICATION_REMOVED: {
      const { index }: { index: number } = action;
      return [...state.slice(0, index), ...state.slice(index + 1)];
    }
    case NOTIFICATION_CLEAR: {
      const { force }: { force: boolean } = action;
      return force ? INITIAL_STATE : state.filter(notif => notif.persistent);
    }
    default: {
      return state;
    }
  }
}
