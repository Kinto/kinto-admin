import { removeNotification, useNotifications } from "@src/hooks/notifications";
import type { Notifications } from "@src/types";
import React from "react";
import Toast from "react-bootstrap/Toast";

function NotificationDetails({ details }: { details: string[] }) {
  if (details.length === 0) {
    return null;
  }
  if (details.length === 1) {
    return (
      <Toast.Body>
        <span>{details[0]}</span>
      </Toast.Body>
    );
  }
  return (
    <Toast.Body>
      <ul>
        {details.map((detail, index) => {
          return <li key={index}>{detail}</li>;
        })}
      </ul>
    </Toast.Body>
  );
}

export default function Notifications() {
  const notifications = useNotifications();

  const alerts = notifications.map(
    ({ message: headline, details = [], timeout, type }, i) => {
      return (
        <Toast
          className={`bg-${type}`}
          key={`notification-${i}`}
          autohide={timeout > 0}
          delay={timeout > 0 ? timeout : undefined}
          onClose={() => {
            removeNotification(i);
          }}
        >
          <Toast.Header closeButton={false}>
            {headline}
            <button
              className="close"
              title="Dismiss"
              aria-label="Dismiss"
              onClick={() => {
                removeNotification(i);
              }}
            >
              x
            </button>
          </Toast.Header>
          <NotificationDetails details={details} />
        </Toast>
      );
    }
  );

  return <div className="notifications">{alerts}</div>;
}
