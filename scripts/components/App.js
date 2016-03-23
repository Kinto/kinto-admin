import React, { Component } from "react";

export default class App extends Component {
  render() {
    const {sidebar, notifications, content, notificationList} = this.props;
    const notificationsClass = notificationList.length ?
                               " with-notifications" : "";
    const contentClasses = `content${notificationsClass}`;
    return (
      <div className="main">
        <div className="sidebar">
          {sidebar || <p>Sidebar.</p>}
        </div>
        <div className={contentClasses}>
          {notifications || <div/>}
          {content || <p>Default.</p>}
        </div>
      </div>
    );
  }
}
