/* @flow */
import type {
  SessionState,
  Notifications as NotificationsType,
  Plugin,
} from "../types";
import type { Location, Match } from "react-router-dom";
import type { Element } from "react";
import { Component } from "react";
import { Redirect, Switch } from "react-router-dom";
import { isObject } from "../utils";
import { mergeObjects } from "react-jsonschema-form/lib/utils";

import { CreateRoute } from "../routes";

import { PureComponent } from "react";
import * as React from "react";
import { Breadcrumbs } from "react-breadcrumbs";
import HomePage from "../containers/HomePage";
import Notifications from "../containers/Notifications";
import Sidebar from "../containers/Sidebar";
import BucketCreatePage from "../containers/bucket/BucketCreatePage";
import BucketGroupsPage from "../containers/bucket/BucketGroupsPage";
import GroupCreatePage from "../containers/group/GroupCreatePage";
import GroupAttributesPage from "../containers/group/GroupAttributesPage";
import GroupPermissionsPage from "../containers/group/GroupPermissionsPage";
import GroupHistoryPage from "../containers/group/GroupHistoryPage";
import BucketAttributesPage from "../containers/bucket/BucketAttributesPage";
import BucketPermissionsPage from "../containers/bucket/BucketPermissionsPage";
import BucketHistoryPage from "../containers/bucket/BucketHistoryPage";

function UserInfo({ session }) {
  const {
    serverInfo: { user = {} },
  } = session;
  if (!user.id) {
    return <strong>Anonymous</strong>;
  }
  return (
    <span>
      Connected as <strong>{user.id}</strong>
    </span>
  );
}

function SessionInfoBar({ session, logout }) {
  const {
    serverInfo: { url },
  } = session;
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

function registerPluginsComponentHooks(PageContainer, plugins) {
  // Extract the container wrapped component (see react-redux connect() API)
  const { WrappedComponent } = PageContainer;
  // By convention, the hook namespace is the wrapped component name
  const namespace = WrappedComponent.displayName;
  if (!namespace) {
    throw new Error("can't happen -- component with no display name");
  }
  // Retrieve all the hooks if any
  const hooks = plugins.map(plugin => plugin.hooks).filter(isObject);
  // Merge all the hooks together, recursively grouped by namespaces
  const mergedHooks = hooks.reduce((acc, hookObject) => {
    return mergeObjects(acc, hookObject, true);
  }, {});
  // Wrap the root component, augmenting its props with the plugin hooks for it.
  return class extends Component<*> {
    render() {
      return (
        <PageContainer
          {...this.props}
          pluginHooks={mergedHooks[namespace] || {}}
        />
      );
    }
  };
}

type Props = {
  session: SessionState,
  logout: () => void,
  notificationList: NotificationsType,
  routes: Element<*>[],
  sidebar: Element<*>,
  notifications: Element<*>,
  content: Element<*>,
  plugins: Plugin[],
  location: Location,
  match: Match,
  routeUpdated: (Object, Location) => void,
};

export default class App extends PureComponent<Props> {
  render() {
    const {
      session,
      logout,
      notificationList,
      routes,
      plugins,
      location,
      match,
    } = this.props;
    const { params } = match;
    const notificationsClass = notificationList.length
      ? " with-notifications"
      : "";
    const contentClasses = `col-sm-9 content${notificationsClass}`;
    const version =
      process.env.REACT_APP_VERSION || process.env.KINTO_ADMIN_VERSION;
    const HookedSidebar = registerPluginsComponentHooks(Sidebar, plugins);
    const HookedNotifications = registerPluginsComponentHooks(
      Notifications,
      plugins
    );
    return (
      <div>
        {session.authenticated && (
          <SessionInfoBar session={session} logout={logout} />
        )}
        <div className="container-fluid main">
          <div className="row">
            <div className="col-sm-3 sidebar">
              <h1 className="kinto-admin-title">Kinto admin</h1>
              <HookedSidebar location={location} params={params} />
            </div>
            <div className={contentClasses}>
              <HookedNotifications />
              <Breadcrumbs separator=" / " />
              <Switch>
                <CreateRoute exact title="home" path="/" component={HomePage} />
                <CreateRoute
                  exact
                  title="auth"
                  path="/auth/:payload/:token"
                  component={HomePage}
                />
                {/* /buckets */}
                <Redirect exact from="/buckets" to="/" />
                <CreateRoute title="home" path="/">
                  <Switch>
                    <CreateRoute title="buckets" path="/buckets">
                      <Switch>
                        <CreateRoute
                          exact
                          title="create"
                          path="/buckets/create"
                          component={BucketCreatePage}
                        />
                        <Redirect
                          exact
                          from="/buckets/:bid"
                          to="/buckets/:bid/collections"
                        />
                        <CreateRoute title=":bid" path="/buckets/:bid">
                          <Switch>
                            <CreateRoute
                              exact
                              title="groups"
                              path="/buckets/:bid/groups"
                              component={BucketGroupsPage}
                            />
                            <CreateRoute
                              title="groups"
                              path="/buckets/:bid/groups">
                              <Switch>
                                <CreateRoute
                                  exact
                                  title="create"
                                  path="/buckets/:bid/groups/create"
                                  component={GroupCreatePage}
                                />
                                <Redirect
                                  exact
                                  from="/buckets/:bid/groups/:gid"
                                  to="/buckets/:bid/groups/:gid/attributes"
                                />
                                <CreateRoute
                                  exact
                                  title="attributes"
                                  path="/buckets/:bid/groups/:gid/attributes"
                                  component={GroupAttributesPage}
                                />
                                {/* /buckets/:bid/groups/:gid/permissions */}
                                <CreateRoute
                                  exact
                                  title="permissions"
                                  path="/buckets/:bid/groups/:gid/permissions"
                                  component={GroupPermissionsPage}
                                />
                                {/* /buckets/:bid/groups/:gid/history */}
                                <CreateRoute
                                  exact
                                  title="history"
                                  path="/buckets/:bid/groups/:gid/history"
                                  component={GroupHistoryPage}
                                />
                              </Switch>
                            </CreateRoute>
                            {/* /buckets/:bid/attributes */}
                            <CreateRoute
                              exact
                              title="attributes"
                              path="/buckets/:bid/attributes"
                              component={BucketAttributesPage}
                            />
                            {/* /buckets/:bid/permissions */}
                            <CreateRoute
                              exact
                              title="permissions"
                              path="/buckets/:bid/permissions"
                              component={BucketPermissionsPage}
                            />
                            {/* /buckets/:bid/history */}
                            <CreateRoute
                              exact
                              title="history"
                              path="/buckets/:bid/history"
                              component={BucketHistoryPage}
                            />
                          </Switch>
                        </CreateRoute>
                      </Switch>
                    </CreateRoute>
                    <CreateRoute
                      title="not found"
                      component={_ => <h1>Page not found.</h1>}
                    />
                  </Switch>
                </CreateRoute>
              </Switch>
            </div>
          </div>
          <hr />
          <p className="text-center">
            <a href="https://github.com/Kinto/kinto-admin">
              Powered by kinto-admin
            </a>
            {!version ? null : (
              <span>
                &nbsp;v
                <a
                  href={`https://github.com/Kinto/kinto-admin/releases/tag/v${version}`}>
                  {version}
                </a>
              </span>
            )}.
          </p>
        </div>
      </div>
    );
  }
}
