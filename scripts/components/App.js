import React, { Component } from "react";


function SessionInfoBar({session, logout}) {
  const {server, username} = session;
  return (
    <div className="session-info-bar text-right">
      Connected as <strong>{username}</strong> on <strong>{server}</strong>
      <a href="" className="btn btn-xs btn-success"
          onClick={(event) => event.preventDefault() || logout()}>logout</a>
    </div>
  );
}

export default class App extends Component {
  render() {
    const {
      sidebar,
      session,
      logout,
      notifications,
      content,
      notificationList,
      linkBack
    } = this.props;
    const notificationsClass = notificationList.length ?
                               " with-notifications" : "";
    const contentClasses = `col-sm-9 content${notificationsClass}`;
    return (
      <div>
        {session.authenticated ?
          <SessionInfoBar session={session} logout={logout} /> : null}
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
      </div>
    );
  }
}
