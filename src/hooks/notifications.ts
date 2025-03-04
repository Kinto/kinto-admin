import { ClientError, Notification } from "@src/types";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

const DEFAULT_NOTIFICATIONS_TIMEOUT = 4000; // milliseconds

type Levels = "info" | "success" | "warning" | "danger";

type NotificationOptions = {
  details?: string[];
  timeout?: null;
};

function makeObservable(target) {
  let listeners = []; // initial listeners can be passed an an argument aswell
  let value = target;

  function get() {
    return value;
  }

  function set(newValue) {
    if (value === newValue) return;
    value = newValue;
    listeners.forEach(l => l(value));
  }

  function subscribe(listenerFunc) {
    listeners.push(listenerFunc);
    return () => unsubscribe(listenerFunc); // will be used inside React.useEffect
  }

  function unsubscribe(listenerFunc) {
    listeners = listeners.filter(l => l !== listenerFunc);
  }

  return {
    get,
    set,
    subscribe,
  };
}

let notifications = [];
let state = makeObservable(notifications);

export function useNotifications(): Notification[] {
  const [val, setVal] = useState(notifications);

  useEffect(() => {
    return state.subscribe(val => {
      console.log("setting val", val);
      setVal(val);
    });
  }, []);

  return val;
}

function notify(type: Levels, message: string, options: NotificationOptions) {
  state.set([
    ...notifications,
    {
      type: type,
      message: message,
      details: options?.details || [],
      timeout: options?.timeout || DEFAULT_NOTIFICATIONS_TIMEOUT,
    },
  ]);
}

export function removeNotification(index: number) {
  notifications.splice(index, 1);
  state.set(notifications);
}

export function clearNotifications() {
  state.set([]);
}

export function notifyInfo(message: string, options: NotificationOptions) {
  notify("info", message, options);
}

export function notifySuccess(
  message: string,
  options: NotificationOptions = {}
) {
  notify("success", message, options);
}

export function notifyWarning(
  message: string,
  options: NotificationOptions = {}
) {
  notify("warning", message, options);
}

export function notifyError(
  message: string,
  error?: ClientError | null,
  options: NotificationOptions = {}
) {
  console.error(error);
  notify("danger", message, {
    timeout: null, // Do not auto-hide errors.
    details: options.details || getErrorDetails(error),
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
