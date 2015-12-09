export const NOTIFICATION_ADDED = "NOTIFICATION_ADDED";
export const NOTIFICATION_REMOVED = "NOTIFICATION_REMOVED";
export const NOTIFICATION_CLEAR = "NOTIFICATION_CLEAR";

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

export function notifyError(error) {
  return notify("error", error.message, error.details);
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
