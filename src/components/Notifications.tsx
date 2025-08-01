import { removeNotification, useNotifications } from "@src/hooks/notifications";
import type { Notifications } from "@src/types";
import React from "react";
import { AlertList } from "react-bs-notifier";

function NotificationDetails({ details }: { details: string[] }) {
  if (details.length === 0) {
    return null;
  }
  if (details.length === 1) {
    return <span>{details[0]}</span>;
  }
  return (
    <ul>
      {details.map((detail, index) => {
        return <li key={index}>{detail}</li>;
      })}
    </ul>
  );
}

export default function Notifications() {
  const notifications = useNotifications();
  const alerts = notifications.map(
    ({ message: headline, details = [], ...attrs }, i) => {
      const message = <NotificationDetails details={details} />;
      return { id: i, headline, message, ...attrs };
    }
  );

  const onDismiss = ({ id: index }) => removeNotification(index);
  return (
    <div className="notifications">
      <AlertList
        alerts={alerts}
        onDismiss={onDismiss}
        data-testid="notifications"
      />
    </div>
  );
}
