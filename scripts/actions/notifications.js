/* @flow */

import type { Action } from "../types";

import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";


function notify(
  type: string,
  message: string,
  options: Object = {}
): Action {
  const {
    clear = true,
    persistent = false,
    details = [],
  } = options;
  return {
    type: NOTIFICATION_ADDED,
    clear,
    notification: {
      type,
      persistent,
      message,
      details,
    },
  };
}

export function notifyInfo(message: string, options: Object={}): Action {
  return notify("info", message, options);
}

export function notifySuccess(message: string, options: Object={}): Action {
  return notify("success", message, options);
}

export function notifyError(error: Error, options: Object={}): Action {
  console.error(error);
  return notify("danger", error.message, options);
}

export function removeNotification(index: number): Action {
  return {type: NOTIFICATION_REMOVED, index};
}

export function clearNotifications(options: Object={}): Action {
  return {type: NOTIFICATION_CLEAR, force: !!options.force};
}
