import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";


function notify(type, message, details=[], options={persistent: false}) {
  const {persistent} = options;
  return {
    type: NOTIFICATION_ADDED,
    notification: {
      type,
      persistent,
      message,
      details,
      time: new Date().getTime(),
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
