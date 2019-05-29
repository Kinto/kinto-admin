/* @flow */
import type { Notifications } from "../types";

import React, { PureComponent } from "react";
import { AlertList } from "react-bs-notifier";
import * as actions from "../actions/notifications";

class ErrorDetails extends PureComponent<{ details: Array<string> }> {
  render() {
    const { details } = this.props;
    if (details.length === 0) {
      return null;
    }
    return (
      <ul>
        {details.map((error, index) => {
          return <li key={index}>{error}</li>;
        })}
      </ul>
    );
  }
}

export type StateProps = {|
  notifications: Notifications,
|};

export type Props = {
  ...StateProps,
  removeNotification: typeof actions.removeNotification,
};

export default class Notifications_ extends PureComponent<Props> {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "Notifications";

  render() {
    const { notifications, removeNotification } = this.props;
    const alerts = notifications.map(
      ({ message: headline, details, ...attrs }, i) => {
        const message = <ErrorDetails details={details} />;
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
