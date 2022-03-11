import type { Notifications } from "../types";

import React, { PureComponent } from "react";
import { AlertList } from "react-bs-notifier";
import * as actions from "../actions/notifications";

class NotificationDetails extends PureComponent<{ details: Array<string> }> {
  render() {
    const { details } = this.props;
    if (details.length === 0) {
      return null;
    }
    if (details.length === 1) {
      return details[0];
    }
    return (
      <ul>
        {details.map((detail, index) => {
          return <li key={index}>{detail}</li>;
        })}
      </ul>
    );
  }
}

export type StateProps = {
  notifications: Notifications;
};

export type Props = StateProps & {
  removeNotification: typeof actions.removeNotification;
};

export default class Notifications_ extends PureComponent<Props> {
  static displayName = "Notifications";

  render() {
    const { notifications, removeNotification } = this.props;
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
}
