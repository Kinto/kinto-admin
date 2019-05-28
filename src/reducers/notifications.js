/* @flow */

import type { Notifications, Notification } from "../types";
import { NOTIFICATION_ADDED, NOTIFICATION_REMOVED } from "../constants";

const INITIAL_STATE: Notifications = [];

export default function notifications(
  state: Notifications = INITIAL_STATE,
  action: Object
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
    default: {
      return state;
    }
  }
}
