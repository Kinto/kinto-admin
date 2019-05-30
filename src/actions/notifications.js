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

type NotificationOptions = {
  details?: string[],
  timeout?: ?number,
};

type NotificationAction = {
  type: "NOTIFICATION_ADDED",
  notification: {
    type: Levels,
    message: string,
    details: string[],
    timeout: ?number,
  },
};

type Levels = "info" | "success" | "warning" | "danger";

function notify(
  type: Levels,
  message: string,
  options: NotificationOptions = {}
): NotificationAction {
  const {
    details = [],
    timeout = DEFAULT_NOTIFICATIONS_TIMEOUT,
  } = options;
  return {
    type: NOTIFICATION_ADDED,
    notification: {
      type,
      message,
      details,
      timeout,
    },
  };
}

export function notifyInfo(
  message: string,
  options: NotificationOptions = {}
): NotificationAction {
  return notify("info", message, options);
}

export function notifySuccess(
  message: string,
  options: NotificationOptions = {}
): NotificationAction {
  return notify("success", message, options);
}

export function notifyWarning(
  message: string,
  options: NotificationOptions = {}
): NotificationAction {
  return notify("warning", message, options);
}

export function notifyError(
  message: string,
  error: ?ClientError,
  options: NotificationOptions = {}
): NotificationAction {
  console.error(error);
  return notify("danger", message, {
    timeout: null, // Do not auto-hide errors.
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
