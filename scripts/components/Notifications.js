import React, { Component} from "react";

class ErrorDetails extends Component {
  static defaultProps = {
    details: []
  };

  render() {
    const { details } = this.props;
    if (details.length === 0) {
      return null;
    }
    return (
      <ul>{
        details.map((error, index) => {
          return <li key={index}>{error}</li>;
        })
      }</ul>
    );
  }
}

export class Notification extends Component {
  onCloseClick(event) {
    event.preventDefault();
    this.props.close();
  }

  render() {
    return (
      <div className={`notification notification-${this.props.type}`}>
        <a className="close" href=""
          onClick={this.onCloseClick.bind(this)}>✖</a>
        <h2>
          {this.props.type || "Info"}{" "}
          <small>[{new Date(this.props.time).toLocaleString()}]</small>
        </h2>
        <p>{this.props.message}</p>
        <ErrorDetails details={this.props.details} />
      </div>
    );
  }
}

export default class Notifications extends Component {
  render() {
    const {notifications, removeNotification} = this.props;
    if (!notifications.length) {
      // This is required to avoid jsdom to explode when a component DOM
      // fragment is rerendered empty by React.
      return <div/>;
    }
    return (
      <div className="notifications">{
        notifications.map((notification, index) => {
          return <Notification key={index} {...notification}
            close={removeNotification.bind(null, index)} />;
        })
      }</div>
    );
  }
}
