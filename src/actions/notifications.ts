import {
  NOTIFICATION_ADDED,
  NOTIFICATION_CLEAR,
  NOTIFICATION_REMOVED,
} from "@src/constants";
import type { ClientError } from "@src/types";

const DEFAULT_NOTIFICATIONS_TIMEOUT = 4000; // milliseconds

function getErrorDetails(error: ClientError | null | undefined): string[] {
  if (!error) {
    return [];
  }
  const {
    data: { code, message: errorMessage, details: errorDetails } = {},
    message,
  } = error;
  let details = [message];
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
  details?: string[];
  timeout?: null;
};

type NotificationAction = {
  type: "NOTIFICATION_ADDED";
  notification: {
    type: Levels;
    message: string;
    details: string[];
    timeout: number | null | undefined;
  };
};

type Levels = "info" | "success" | "warning" | "danger";

function notify(
  type: Levels,
  message: string,
  options: NotificationOptions = {}
): NotificationAction {
  const { details = [], timeout = DEFAULT_NOTIFICATIONS_TIMEOUT } = options;
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
  error?: ClientError | null,
  options: NotificationOptions = {}
): NotificationAction {
  console.error(error);
  return notify("danger", message, {
    timeout: null, // Do not auto-hide errors.
    details: options.details || getErrorDetails(error),
  });
}

export function removeNotification(index: number): {
  type: "NOTIFICATION_REMOVED";
  index: number;
} {
  return { type: NOTIFICATION_REMOVED, index };
}

export function clearNotifications(): {
  type: "NOTIFICATION_CLEAR";
} {
  return { type: NOTIFICATION_CLEAR };
}
