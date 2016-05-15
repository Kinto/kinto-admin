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

  getHeading() {
    const {type} = this.props;
    const messages = {
      info: "Info",
      danger: "Error",
      success: "Success",
      warning: "Warning",
    };
    return messages["type" in messages ? type : "info"];
  }

  render() {
    return (
      <div className={`alert notification alert-${this.props.type}`}>
        <a className="close" href=""
          onClick={this.onCloseClick.bind(this)}>✖</a>
        <h4>
          {this.getHeading()}
          <small>[{new Date(this.props.time).toLocaleString()}]</small>
        </h4>
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
