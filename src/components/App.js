import React, { Component } from "react";
import Breadcrumbs from "react-breadcrumbs";


function SessionInfoBar({session, logout}) {
  const {server, credentials={}} = session;
  const {username} = credentials;
  const userInfo = username ? <span>as <strong>{username}</strong></span> : "";
  return (
    <div className="session-info-bar text-right">
      Connected {userInfo} on <strong>{server}</strong>
      <a href="" className="btn btn-xs btn-success btn-logout"
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
      linkBack,
      routes,
      params,
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
              <h1 className="kinto-admin-title">Kinto admin</h1>
              {linkBack}
              {sidebar || <p>Sidebar.</p>}
            </div>
            <div className={contentClasses}>
              {notifications || <div/>}
              <Breadcrumbs
                routes={routes}
                params={params}
                separator=" / " />
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
