import Breadcrumbs from "./Breadcrumbs";
import { SessionInfoBar } from "./SessionInfoBar";
import { HomePage } from "@src/components/HomePage";
import { Sidebar } from "@src/components/Sidebar";
import { BucketPermissions } from "@src/components/bucket/BucketPermissions";
import { CollectionPermissions } from "@src/components/collection/CollectionPermissions";
import { GroupPermissions } from "@src/components/group/GroupPermissions";
import { RecordPermissions } from "@src/components/record/RecordPermissions";
import Notifications from "@src/containers/Notifications";
import BucketAttributesPage from "@src/containers/bucket/BucketAttributesPage";
import BucketCollectionsPage from "@src/containers/bucket/BucketCollectionsPage";
import BucketCreatePage from "@src/containers/bucket/BucketCreatePage";
import BucketGroupsPage from "@src/containers/bucket/BucketGroupsPage";
import BucketHistoryPage from "@src/containers/bucket/BucketHistoryPage";
import CollectionAttributesPage from "@src/containers/collection/CollectionAttributesPage";
import CollectionCreatePage from "@src/containers/collection/CollectionCreatePage";
import CollectionHistoryPage from "@src/containers/collection/CollectionHistoryPage";
import CollectionRecordsPage from "@src/containers/collection/CollectionRecordsPage";
import GroupAttributesPage from "@src/containers/group/GroupAttributesPage";
import GroupCreatePage from "@src/containers/group/GroupCreatePage";
import GroupHistoryPage from "@src/containers/group/GroupHistoryPage";
import RecordAttributesPage from "@src/containers/record/RecordAttributesPage";
import RecordBulkPage from "@src/containers/record/RecordBulkPage";
import RecordCreatePage from "@src/containers/record/RecordCreatePage";
import RecordHistoryPage from "@src/containers/record/RecordHistoryPage";
import SimpleReviewPage from "@src/containers/signoff/SimpleReviewPage";
import { useAppSelector } from "@src/hooks/app";
import { CreateRoute } from "@src/routes";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

export function Layout() {
  const authenticated = useAppSelector(store => store.session.authenticated);
  const contentClasses = `col-sm-9 content`;
  const version = KINTO_ADMIN_VERSION;
  return (
    <div>
      {authenticated && <SessionInfoBar />}
      <div className="container-fluid main">
        <div className="row">
          <div className="col-sm-3 sidebar">
            {authenticated && (
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
            )}
          </div>
          <div className={contentClasses}>
            <Notifications />
            {authenticated && <Breadcrumbs separator=" / " />}
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
                            path="/buckets/:bid/groups"
                          >
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
                                path="/buckets/:bid/groups/:gid"
                              >
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
                                    component={GroupPermissions}
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
                            component={BucketPermissions}
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
                            path="/buckets/:bid/collections"
                          >
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
                                path="/buckets/:bid/collections/:cid"
                              >
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
                                    component={CollectionPermissions}
                                  />
                                  <CreateRoute
                                    exact
                                    title="history"
                                    path="/buckets/:bid/collections/:cid/history"
                                    component={CollectionHistoryPage}
                                  />
                                  <CreateRoute
                                    exact
                                    title="simple-review"
                                    path="/buckets/:bid/collections/:cid/simple-review"
                                    component={SimpleReviewPage}
                                  />
                                  <CreateRoute
                                    exact
                                    title="records"
                                    path="/buckets/:bid/collections/:cid/records"
                                    component={CollectionRecordsPage}
                                  />
                                  <CreateRoute
                                    title="records"
                                    path="/buckets/:bid/collections/:cid/records"
                                  >
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
                                        path="/buckets/:bid/collections/:cid/records/:rid"
                                      >
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
                                            path={[
                                              "permissions",
                                              "/buckets/:bid/collections/:cid/records/:rid/permissions",
                                            ]}
                                            component={RecordPermissions}
                                          />
                                          <CreateRoute
                                            exact
                                            title="history"
                                            path={[
                                              "history",
                                              "/buckets/:bid/collections/:cid/records/:rid/history",
                                            ]}
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
                href={`https://github.com/Kinto/kinto-admin/releases/tag/v${version}`}
              >
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
