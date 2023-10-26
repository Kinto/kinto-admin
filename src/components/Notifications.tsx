import type { Notifications } from "../types";

import React from "react";
import { AlertList } from "react-bs-notifier";
import * as actions from "../actions/notifications";

function NotificationDetails({ details }: { details: Array<string> }) {
  if (details.length === 0) {
    return null;
  }
  if (details.length === 1) {
    return <span>details[0]</span>;
  }
  return (
    <ul>
      {details.map((detail, index) => {
        return <li key={index}>{detail}</li>;
      })}
    </ul>
  );
}

export type StateProps = {
  notifications: Notifications;
};

export type Props = StateProps & {
  removeNotification: typeof actions.removeNotification;
};

export default function Notifications({
  notifications,
  removeNotification,
}: Props) {
  const alerts = notifications.map(
    ({ message: headline, details = [], ...attrs }, i) => {
      const message = <NotificationDetails details={details} />;
      return { id: i, headline, message, ...attrs };
    }
  );
  const onDismiss = ({ id: index }) => removeNotification(index);
  return (
    <div className="notifications">
      <AlertList alerts={alerts} onDismiss={onDismiss} />
    </div>
  );
}
