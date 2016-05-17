import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../constants";


function notify(type, message, details=[]) {
  return {
    type: NOTIFICATION_ADDED,
    notification: {
      type,
      message,
      details,
      time: new Date().getTime(),
    },
  };
}

export function notifyInfo(message) {
  return notify("info", message);
}

export function notifySuccess(message) {
  return notify("success", message);
}

export function notifyError(error) {
  return notify("danger", error.message, error.details);
}

export function removeNotification(index) {
  return {
    type: NOTIFICATION_REMOVED,
    index,
  };
}

export function clearNotifications() {
  return {
    type: NOTIFICATION_CLEAR,
  };
}
