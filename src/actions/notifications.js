/* @flow */

import type { ClientError } from "../types";

import { NOTIFICATION_ADDED, NOTIFICATION_REMOVED } from "../constants";

const DEFAULT_NOTIFICATIONS_TIMEOUT = 4000; // milliseconds

function getErrorDetails(error: ?ClientError): string[] {
  if (!error) {
    return [];
  }
  const { data: errorData = {}, message } = error;
  let details = [message];
  const { code, message: errorMessage, details: errorDetails } = errorData;
  if (!code) {
    return details;
  }
  switch (code) {
    case 412: {
      if (errorDetails && errorDetails.existing && errorDetails.existing.id) {
        const id = errorDetails.existing.id;
        return [
          `Resource ${id} already exists or has been modified meanwhile.`,
          ...details,
        ];
      }
      return details;
    }
    default:
      return [errorMessage || "Unspecified error.", ...details];
  }
}

type NotificationAction = {
  type: "NOTIFICATION_ADDED",
  clear: boolean,
  notification: {
    type: Levels,
    message: string,
    persistent: boolean,
    message: string,
    details: string[],
  },
};

type Levels = "info" | "success" | "warning" | "danger";

function notify(
  type: Levels,
  message: string,
  options: Object = {}
): NotificationAction {
  const { clear = true, persistent = false, details = [], timeout = DEFAULT_NOTIFICATIONS_TIMEOUT } = options;
  return {
    type: NOTIFICATION_ADDED,
    clear,
    notification: {
      type,
      persistent,
      message,
      details,
      timeout,
    },
  };
}

export function notifyInfo(
  message: string,
  options: Object = {}
): NotificationAction {
  return notify("info", message, options);
}

export function notifySuccess(
  message: string,
  options: Object = {}
): NotificationAction {
  return notify("success", message, options);
}

export function notifyWarning(
  message: string,
  options: Object = {}
): NotificationAction {
  return notify("warning", message, options);
}

export function notifyError(
  message: string,
  error: ?ClientError,
  options: Object = {}
): NotificationAction {
  console.error(error);
  return notify("danger", message, {
    timeout: null,  // Do not auto-hide errors.
    details: options.details || getErrorDetails(error),
  });
}

export function removeNotification(
  index: number
): {
  type: "NOTIFICATION_REMOVED",
  index: number,
} {
  return { type: NOTIFICATION_REMOVED, index };
}
