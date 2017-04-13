/* @flow */
import type { SessionState, RouteParams, Notifications } from "../types";

import React, { PureComponent } from "react";
import Breadcrumbs from "react-breadcrumbs";

function UserInfo({ session }) {
  const { serverInfo: { user = {} } } = session;
  if (!user.id) {
    return <strong>Anonymous</strong>;
  }
  return <span>Connected as <strong>{user.id}</strong></span>;
}

function SessionInfoBar({ session, logout }) {
  const { serverInfo: { url } } = session;
  return (
    <div className="session-info-bar text-right">
      <UserInfo session={session} /> on <strong>{url}</strong>
      <a
        href=""
        className="btn btn-xs btn-success btn-logout"
        onClick={event => event.preventDefault() || logout()}>
        logout
      </a>
    </div>
  );
}

export default class App extends PureComponent {
  props: {
    session: SessionState,
    logout: () => void,
    notificationList: Notifications,
    routes: Element[],
    params: RouteParams,
    sidebar: Element,
    notifications: Element,
    content: Element,
  };

  render() {
    const {
      sidebar,
      session,
      logout,
      notifications,
      content,
      notificationList,
      routes,
      params,
    } = this.props;
    const notificationsClass = notificationList.length
      ? " with-notifications"
      : "";
    const contentClasses = `col-sm-9 content${notificationsClass}`;
    const version =
      process.env.REACT_APP_VERSION || process.env.KINTO_ADMIN_VERSION;
    return (
      <div>
        {session.authenticated &&
          <SessionInfoBar session={session} logout={logout} />}
        <div className="container-fluid main">
          <div className="row">
            <div className="col-sm-3 sidebar">
              <h1 className="kinto-admin-title">Kinto admin</h1>
              {sidebar || <p>Sidebar.</p>}
            </div>
            <div className={contentClasses}>
              {notifications || <div />}
              <Breadcrumbs routes={routes} params={params} separator=" / " />
              {content || <p>Default.</p>}
            </div>
          </div>
          <hr />
          <p className="text-center">
            <a href="https://github.com/Kinto/kinto-admin">
              Powered by kinto-admin
            </a>
            {!version
              ? null
              : <span>
                  &nbsp;v
                  <a
                    href={`https://github.com/Kinto/kinto-admin/releases/tag/v${version}`}>
                    {version}
                  </a>
                </span>}.
          </p>
        </div>
      </div>
    );
  }
}
