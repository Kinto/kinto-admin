/* @flow */

import type { Action, ClientError } from "../types";

import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";


function getErrorDetails(error: ?(Error | ClientError)): string[] {
  if (!error) {
    return [];
  }
  const {message} = error;
  let details = [message];
  if (!error.data) {
    return details;
  }
  const {code, message: errorMessage, details: errorDetails} = error.data;
  switch(code) {
    case 403: {
      return [errorMessage || "Unauthorized access.", ...details];
    }
    case 404: {
      return [errorMessage || "Resource not found.", ...details];
    }
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
    default: return [];
  }
}

function notify(type: string, message: string, options: Object = {}): Action {
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

export function notifyError(
  message: string,
  error:   ?(Error | ClientError),
  options: Object={}
): Action {
  console.error(error);
  return notify("danger", message, {
    details: options.details || getErrorDetails(error),
  });
}

export function removeNotification(index: number): Action {
  return {type: NOTIFICATION_REMOVED, index};
}

export function clearNotifications(options: Object={}): Action {
  return {type: NOTIFICATION_CLEAR, force: !!options.force};
}
