/* @flow */
import type {
  SessionState,
  Notifications as NotificationsType,
} from "../types";
import type { Element } from "react";
import { Redirect, Switch, Route } from "react-router-dom";

import { CreateRoute } from "../routes";

import { PureComponent } from "react";
import * as React from "react";
import { Breadcrumbs } from "react-breadcrumbs";
import HomePage from "../containers/HomePage";
import BucketAttributesPage from "../containers/bucket/BucketAttributesPage";
import BucketCollectionsPage from "../containers/bucket/BucketCollectionsPage";
import BucketCreatePage from "../containers/bucket/BucketCreatePage";
import BucketGroupsPage from "../containers/bucket/BucketGroupsPage";
import BucketHistoryPage from "../containers/bucket/BucketHistoryPage";
import BucketPermissionsPage from "../containers/bucket/BucketPermissionsPage";
import CollectionAttributesPage from "../containers/collection/CollectionAttributesPage";
import CollectionCreatePage from "../containers/collection/CollectionCreatePage";
import CollectionHistoryPage from "../containers/collection/CollectionHistoryPage";
import CollectionPermissionsPage from "../containers/collection/CollectionPermissionsPage";
import GroupAttributesPage from "../containers/group/GroupAttributesPage";
import GroupCreatePage from "../containers/group/GroupCreatePage";
import GroupHistoryPage from "../containers/group/GroupHistoryPage";
import GroupPermissionsPage from "../containers/group/GroupPermissionsPage";
import RecordCreatePage from "../containers/record/RecordCreatePage";
import RecordBulkPage from "../containers/record/RecordBulkPage";
import RecordAttributesPage from "../containers/record/RecordAttributesPage";
import RecordPermissionsPage from "../containers/record/RecordPermissionsPage";
import RecordHistoryPage from "../containers/record/RecordHistoryPage";

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

type Props = {
  session: SessionState,
  logout: () => void,
  notificationList: NotificationsType,
  notifications: React.ComponentType<*>,
  sidebar: React.ComponentType<*>,
  collectionRecords: Element<*>,
  pluginsRoutes: Element<*>[],
};

export default class App extends PureComponent<Props> {
  render() {
    const {
      session,
      logout,
      notificationList,
      sidebar: Sidebar,
      notifications: Notifications,
      collectionRecords: CollectionRecordsPage,
      pluginsRoutes,
    } = this.props;
    const {
      serverInfo: { project_name },
    } = session;
    const notificationsClass = notificationList.length
      ? " with-notifications"
      : "";
    const contentClasses = `col-sm-9 content${notificationsClass}`;
    const version =
      process.env.REACT_APP_VERSION || process.env.KINTO_ADMIN_VERSION;
    return (
      <div>
        {session.authenticated && (
          <SessionInfoBar session={session} logout={logout} />
        )}
        <div className="container-fluid main">
          <div className="row">
            <div className="col-sm-3 sidebar">
              <h1 className="kinto-admin-title">{project_name}</h1>
              <Switch>
                {/* We need a "sidebar route" for each case where the sidebar
                  needs the :gid or :cid to higlight the proper entry */}
                <Route
                  path="/buckets/:bid/collections/:cid"
                  component={Sidebar}
                />
                <Route path="/buckets/:bid" component={Sidebar} />
                <Route component={Sidebar} />
              </Switch>
            </div>
            <div className={contentClasses}>
              <Notifications />
              {session.authenticated && <Breadcrumbs separator=" / " />}
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
                    {pluginsRoutes}
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
                                  title=":gid"
                                  path="/buckets/:bid/groups/:gid">
                                  <Switch>
                                    <CreateRoute
                                      exact
                                      title="attributes"
                                      path="/buckets/:bid/groups/:gid/attributes"
                                      component={GroupAttributesPage}
                                    />
                                    <CreateRoute
                                      exact
                                      title="permissions"
                                      path="/buckets/:bid/groups/:gid/permissions"
                                      component={GroupPermissionsPage}
                                    />
                                    <CreateRoute
                                      exact
                                      title="history"
                                      path="/buckets/:bid/groups/:gid/history"
                                      component={GroupHistoryPage}
                                    />
                                  </Switch>
                                </CreateRoute>
                              </Switch>
                            </CreateRoute>
                            <CreateRoute
                              exact
                              title="attributes"
                              path="/buckets/:bid/attributes"
                              component={BucketAttributesPage}
                            />
                            <CreateRoute
                              exact
                              title="permissions"
                              path="/buckets/:bid/permissions"
                              component={BucketPermissionsPage}
                            />
                            <CreateRoute
                              exact
                              title="history"
                              path="/buckets/:bid/history"
                              component={BucketHistoryPage}
                            />
                            <CreateRoute
                              exact
                              title="collections"
                              path="/buckets/:bid/collections"
                              component={BucketCollectionsPage}
                            />
                            <CreateRoute
                              title="collections"
                              path="/buckets/:bid/collections">
                              <Switch>
                                <CreateRoute
                                  exact
                                  title="create"
                                  path="/buckets/:bid/collections/create"
                                  component={CollectionCreatePage}
                                />
                                <Redirect
                                  exact
                                  from="/buckets/:bid/collections/:cid"
                                  to="/buckets/:bid/collections/:cid/records"
                                />
                                <CreateRoute
                                  title=":cid"
                                  path="/buckets/:bid/collections/:cid">
                                  <Switch>
                                    <CreateRoute
                                      exact
                                      title="attributes"
                                      path="/buckets/:bid/collections/:cid/attributes"
                                      component={CollectionAttributesPage}
                                    />
                                    <CreateRoute
                                      exact
                                      title="permissions"
                                      path="/buckets/:bid/collections/:cid/permissions"
                                      component={CollectionPermissionsPage}
                                    />
                                    <CreateRoute
                                      exact
                                      title="history"
                                      path="/buckets/:bid/collections/:cid/history"
                                      component={CollectionHistoryPage}
                                    />
                                    <CreateRoute
                                      exact
                                      title="records"
                                      path="/buckets/:bid/collections/:cid/records"
                                      component={CollectionRecordsPage}
                                    />
                                    <CreateRoute
                                      title="records"
                                      path="/buckets/:bid/collections/:cid/records">
                                      <Switch>
                                        <CreateRoute
                                          exact
                                          title="create"
                                          path="/buckets/:bid/collections/:cid/records/create"
                                          component={RecordCreatePage}
                                        />
                                        <CreateRoute
                                          exact
                                          title="bulk create"
                                          path="/buckets/:bid/collections/:cid/records/bulk"
                                          component={RecordBulkPage}
                                        />
                                        <Redirect
                                          exact
                                          from="/buckets/:bid/collections/:cid/records/:rid"
                                          to="/buckets/:bid/collections/:cid/records/:rid/attributes"
                                        />
                                        <CreateRoute
                                          title=":rid"
                                          path="/buckets/:bid/collections/:cid/records/:rid">
                                          <Switch>
                                            <CreateRoute
                                              exact
                                              title="attributes"
                                              path="/buckets/:bid/collections/:cid/records/:rid/attributes"
                                              component={RecordAttributesPage}
                                            />
                                            <CreateRoute
                                              exact
                                              title="permissions"
                                              path="permissions"
                                              path="/buckets/:bid/collections/:cid/records/:rid/permissions"
                                              component={RecordPermissionsPage}
                                            />
                                            <CreateRoute
                                              exact
                                              title="history"
                                              path="history"
                                              path="/buckets/:bid/collections/:cid/records/:rid/history"
                                              component={RecordHistoryPage}
                                            />
                                          </Switch>
                                        </CreateRoute>
                                      </Switch>
                                    </CreateRoute>
                                  </Switch>
                                </CreateRoute>
                              </Switch>
                            </CreateRoute>
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
            )}
            .
          </p>
        </div>
      </div>
    );
  }
}
