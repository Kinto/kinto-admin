import React, { Component } from "react";

export default class App extends Component {
  render() {
    const {sidebar, notifications, content, notificationList} = this.props;
    const notificationsClass = notificationList.length ?
                               " with-notifications" : "";
    const contentClasses = `col-sm-9 content${notificationsClass}`;
    return (
      <div className="container-fluid main">
        <div className="row">
          <div className="col-sm-3 sidebar">
            {sidebar || <p>Sidebar.</p>}
          </div>
          <div className={contentClasses}>
            {notifications || <div/>}
            {content || <p>Default.</p>}
          </div>
        </div>
      </div>
    );
  }
}
