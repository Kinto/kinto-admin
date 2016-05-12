import React, { Component } from "react";

export default class App extends Component {
  render() {
    const {sidebar, notifications, content, notificationList, linkBack} = this.props;
    const notificationsClass = notificationList.length ?
                               " with-notifications" : "";
    const contentClasses = `col-sm-9 content${notificationsClass}`;
    return (
      <div className="container-fluid main">
        <div className="row">
          <div className="col-sm-3 sidebar">
            <h1>Kinto admin</h1>
            {linkBack}
            {sidebar || <p>Sidebar.</p>}
          </div>
          <div className={contentClasses}>
            {notifications || <div/>}
            {content || <p>Default.</p>}
          </div>
        </div>
        <hr/>
        <p className="text-center">
          <a href="https://github.com/Kinto/kinto-admin">Powered by kinto-admin</a>
        </p>
      </div>
    );
  }
}
