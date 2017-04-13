/* @flow */
import type { Notifications } from "../types";

import React, { PureComponent } from "react";

class ErrorDetails extends PureComponent {
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

export class Notification extends PureComponent {
  static defaultProps = {
    type: "info",
    details: [],
  };

  props: {
    type: string,
    message: string,
    details: string[],
    close: () => void,
  };

  state: {
    expanded: boolean,
  };

  constructor(props: Object) {
    super(props);
    this.state = { expanded: false };
  }

  onCloseClick(event: Event) {
    event.preventDefault();
    this.props.close();
  }

  getHeading() {
    const { type } = this.props;
    const messages = {
      info: "Info",
      danger: "Error",
      success: "Success",
      warning: "Warning",
    };
    return messages[type];
  }

  expand = (event: Event) => {
    event.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const { type, message, details } = this.props;
    const { expanded } = this.state;
    return (
      <div className={`alert notification alert-${type}`}>
        <a className="close" href="" onClick={this.onCloseClick.bind(this)}>
          ✖
        </a>
        <h4>{this.getHeading()}</h4>
        <p>
          {message}
          {details.length !== 0 &&
            <a
              href="."
              className="btn-details"
              onClick={this.expand}
              title="Error details">
              <i
                className={`glyphicon glyphicon-triangle-${expanded ? "bottom" : "right"}`}
              />
            </a>}
        </p>
        {expanded && <ErrorDetails details={details} />}
      </div>
    );
  }
}

export default class Notifications_ extends PureComponent {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "Notifications";

  props: {
    notifications: Notifications,
    removeNotification: (index: number) => void,
  };

  render() {
    const { notifications, removeNotification } = this.props;
    if (!notifications.length) {
      // This is required to avoid jsdom to explode when a component DOM
      // fragment is rerendered empty by React.
      return <div />;
    }
    return (
      <div className="notifications">
        {notifications.map((notification, index) => {
          return (
            <Notification
              key={index}
              {...notification}
              close={removeNotification.bind(null, index)}
            />
          );
        })}
      </div>
    );
  }
}
