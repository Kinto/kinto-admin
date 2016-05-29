import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";


function notify(type, message, details=[], options={
  clear: false,
  persistent: false
}) {
  const {clear, persistent} = options;
  return {
    type: NOTIFICATION_ADDED,
    notification: {
      type,
      clear,
      persistent,
      message,
      details,
    },
  };
}

export function notifyInfo(message, options) {
  return notify("info", message, [], options);
}

export function notifySuccess(message, options) {
  return notify("success", message, [], options);
}

export function notifyError(error, options) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
  return notify("danger", error.message, error.details, options);
}

export function removeNotification(index) {
  return {
    type: NOTIFICATION_REMOVED,
    index,
  };
}

export function clearNotifications(options={}) {
  return {
    type: NOTIFICATION_CLEAR,
    force: !!options.force
  };
}
