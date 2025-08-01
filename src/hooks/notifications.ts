import { ClientError, Notification } from "@src/types";
import { makeObservable } from "@src/utils";
import { useEffect, useState } from "react";

const DEFAULT_NOTIFICATIONS_TIMEOUT = 4000; // in milliseconds

type Levels = "info" | "success" | "warning" | "danger";

interface NotificationOptions {
  details?: string[];
  timeout?: number | null;
}

const state = makeObservable([]);

export function useNotifications(): Notification[] {
  const [val, setVal] = useState(state.get());

  useEffect(() => {
    return state.subscribe(setVal);
  }, []);

  return val;
}

function notify(type: Levels, message: string, options: NotificationOptions) {
  let notifications = [...state.get()];
  notifications = [
    ...notifications,
    {
      type: type,
      message: message,
      details: options?.details ?? [],
      timeout: options?.timeout,
    },
  ];
  state.set(notifications);
}

export function removeNotification(index: number) {
  const notifications = [...state.get()];
  notifications.splice(index, 1);
  state.set(notifications);
}

export function clearNotifications() {
  state.set([]);
}

export function notifyInfo(message: string, options: NotificationOptions = {}) {
  notify("info", message, {
    ...options,
    timeout: options.timeout ?? DEFAULT_NOTIFICATIONS_TIMEOUT,
  });
}

export function notifySuccess(
  message: string,
  options: NotificationOptions = {}
) {
  notify("success", message, {
    ...options,
    timeout: options.timeout ?? DEFAULT_NOTIFICATIONS_TIMEOUT,
  });
}

export function notifyWarning(
  message: string,
  options: NotificationOptions = {}
) {
  notify("warning", message, {
    ...options,
    timeout: options.timeout ?? DEFAULT_NOTIFICATIONS_TIMEOUT,
  });
}

export function notifyError(
  message: string,
  error?: ClientError | null,
  options: NotificationOptions = {}
) {
  console.error(error);
  notify("danger", message, {
    timeout: null, // Do not auto-hide errors.
    details: options.details ?? getErrorDetails(error),
  });
}

function getErrorDetails(error: ClientError | null | undefined): string[] {
  if (!error) {
    return [];
  }
  const {
    data: { code, message: errorMessage, details: errorDetails } = {},
    message,
  } = error;
  const details = [message];
  if (!code) {
    return details;
  }
  switch (code) {
    case 412: {
      if (errorDetails?.existing?.id) {
        const id = errorDetails.existing.id;
        return [
          `Resource ${id} already exists or has been modified meanwhile.`,
          ...details,
        ];
      }
      return details;
    }
    default:
      return [errorMessage ?? "Unspecified error.", ...details];
  }
}
