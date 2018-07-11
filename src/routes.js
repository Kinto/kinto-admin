/* @flow */
import type {
  BucketRoute,
  CollectionRoute,
  GroupRoute,
  RecordRoute,
} from "./types";

import React, { Component, PureComponent } from "react";
import { Redirect, Route } from "react-router-dom";
import type { Location, Match } from "react-router-dom";
import { mergeObjects } from "react-jsonschema-form/lib/utils";
import { Breadcrumb } from "react-breadcrumbs";
import type { Dispatch, ActionCreatorOrObjectOfACs } from "redux";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as RouteActions from "./actions/route";

import { isObject } from "./utils";
import { flattenPluginsRoutes } from "./plugin";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import BucketCreatePage from "./containers/bucket/BucketCreatePage";
import BucketAttributesPage from "./containers/bucket/BucketAttributesPage";
import BucketPermissionsPage from "./containers/bucket/BucketPermissionsPage";
import BucketCollectionsPage from "./containers/bucket/BucketCollectionsPage";
import BucketGroupsPage from "./containers/bucket/BucketGroupsPage";
import BucketHistoryPage from "./containers/bucket/BucketHistoryPage";
import GroupCreatePage from "./containers/group/GroupCreatePage";
import GroupAttributesPage from "./containers/group/GroupAttributesPage";
import GroupPermissionsPage from "./containers/group/GroupPermissionsPage";
import GroupHistoryPage from "./containers/group/GroupHistoryPage";
import CollectionRecordsPage from "./containers/collection/CollectionRecordsPage";
import CollectionHistoryPage from "./containers/collection/CollectionHistoryPage";
import CollectionCreatePage from "./containers/collection/CollectionCreatePage";
import CollectionAttributesPage from "./containers/collection/CollectionAttributesPage";
import CollectionPermissionsPage from "./containers/collection/CollectionPermissionsPage";
import RecordCreatePage from "./containers/record/RecordCreatePage";
import RecordBulkPage from "./containers/record/RecordBulkPage";
import RecordAttributesPage from "./containers/record/RecordAttributesPage";
import RecordPermissionsPage from "./containers/record/RecordPermissionsPage";
import RecordHistoryPage from "./containers/record/RecordHistoryPage";
import * as sessionActions from "./actions/session";
import * as bucketActions from "./actions/bucket";
import * as collectionActions from "./actions/collection";
import * as groupActions from "./actions/group";
import * as recordActions from "./actions/record";
import * as notificationActions from "./actions/notifications";

function onAuthEnter(store: Object, { params }) {
  // XXX there's an odd bug where we enter twice this function while we clearly
  // load it once. Note that the state qs value changes, but I don't know why...
  const { payload } = params;
  let { token } = params;
  // Check for an incoming authentication.
  if (payload && token) {
    try {
      const { server, redirectURL, authType } = JSON.parse(atob(payload));
      if (authType.startsWith("openid-")) {
        token = JSON.parse(token).access_token;
      }
      const credentials = { token };
      store.dispatch(
        sessionActions.setup({
          server,
          authType,
          credentials,
          redirectURL,
        })
      );
    } catch (error) {
      const message = "Couldn't proceed with authentication.";
      store.dispatch(notificationActions.notifyError(message, error));
    }
  }
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

type ComponentWrapperProps = {
  component: React.Node,
  location: Location,
  match: Match,
  routeUpdated: (Object, Location) => void,
};

class ComponentWrapper extends PureComponent<ComponentWrapperProps> {
  updateRoute() {
    const { match, location, routeUpdated } = this.props;
    routeUpdated(match.params, location);
  }

  componentDidMount = this.updateRoute;
  componentDidUpdate = (prevProps: ComponentWrapperProps) => {
    if (prevProps.location !== this.props.location) {
      this.updateRoute();
    }
  };

  render() {
    const { component: Component, ...props } = this.props;
    return <Component {...props} />;
  }
}

const routeCreator = ({
  component: Component,
  render,
  routeUpdated,
  children,
  ...props
}) => {
  return (
    <Route
      {...props}
      render={routeProps => {
        // If the name of the route starts with a ":" it's a "match param", so resolve it.
        const title = props.name.startsWith(":")
          ? routeProps.match.params[props.name.slice(1)]
          : props.name;
        return (
          <Breadcrumb
            data={{
              title: title,
              pathname: routeProps.match.url,
            }}>
            {Component ? (
              <ComponentWrapper
                component={Component}
                routeUpdated={routeUpdated}
                {...routeProps}
              />
            ) : render ? (
              render(routeProps)
            ) : (
              children
            )}
          </Breadcrumb>
        );
      }}
    />
  );
};

function mapDispatchToProps(dispatch: Dispatch): ActionCreatorOrObjectOfACs {
  return bindActionCreators(RouteActions, dispatch);
}

export const CreateRoute = connect(
  null,
  mapDispatchToProps
)(routeCreator);

export default function getRoutes(store: Object, plugins: Object[] = []) {
  return (
    <Route
      name="home"
      path="/"
      render={props => <App plugins={plugins} {...props} />}>
      {/* /buckets */}
      <Route exact name="buckets" path="buckets">
        <Redirect to="/" />
        {/* /buckets/:bid/create */}
        <Route exact name="create" path="create" component={BucketCreatePage} />
        {/* /buckets/:bid */}
        <Route exact name=":bid" path=":bid">
          <Redirect to="collections" />
          {/* /buckets/:bid/groups */}
          <Route exact name="groups" path="groups" component={BucketGroupsPage}>
            {/* /buckets/:bid/groups/create */}
            <Route
              exact
              name="create"
              path="create"
              component={GroupCreatePage}
            />
            {/* /buckets/:bid/groups/:gid */}
            <Route exact name=":gid" path=":gid">
              <Redirect to="attributes" />
              {/* /buckets/:bid/groups/:gid/attributes */}
              <Route
                exact
                name="attributes"
                path="attributes"
                component={GroupAttributesPage}
              />
              {/* /buckets/:bid/groups/:gid/permissions */}
              <Route
                exact
                name="permissions"
                path="permissions"
                component={GroupPermissionsPage}
              />
              {/* /buckets/:bid/groups/:gid/history */}
              <Route
                exact
                name="history"
                path="history"
                component={GroupHistoryPage}
              />
            </Route>
          </Route>
          {/* /buckets/:bid/attributes */}
          <Route
            exact
            name="attributes"
            path="attributes"
            component={BucketAttributesPage}
          />
          {/* /buckets/:bid/permissions */}
          <Route
            exact
            name="permissions"
            path="permissions"
            component={BucketPermissionsPage}
          />
          {/* /buckets/:bid/history */}
          <Route
            exact
            name="history"
            path="history"
            component={BucketHistoryPage}
          />
          {/* /buckets/:bid/collections */}
          <Route
            exact
            name="collections"
            path="collections"
            component={BucketCollectionsPage}>
            {/* /buckets/:bid/collections/create */}
            <Route
              exact
              name="create"
              path="create"
              component={CollectionCreatePage}
            />
            {/* /buckets/:bid/collections/:cid */}
            <Route exact name=":cid" path=":cid">
              <Redirect to="records" />
              {/* /buckets/:bid/collections/:cid/attributes */}
              <Route
                exact
                name="attributes"
                path="attributes"
                component={CollectionAttributesPage}
              />
              {/* /buckets/:bid/collections/:cid/permissions */}
              <Route
                exact
                name="permissions"
                path="permissions"
                component={CollectionPermissionsPage}
              />
              {/* /buckets/:bid/collections/:cid/history */}
              <Route
                exact
                name="history"
                path="history"
                component={CollectionHistoryPage}
              />
              {/* /buckets/:bid/collections/:cid/records */}
              <Route
                exact
                name="records"
                path="records"
                component={registerPluginsComponentHooks(
                  CollectionRecordsPage,
                  plugins
                )}>
                {/* /buckets/:bid/collections/:cid/records/create */}
                <Route
                  exact
                  name="create"
                  path="create"
                  component={RecordCreatePage}
                />
                {/* /buckets/:bid/collections/:cid/records/bulk */}
                <Route
                  exact
                  name="bulk create"
                  path="bulk"
                  component={RecordBulkPage}
                />
                {/* /buckets/:bid/collections/:cid/records/:rid */}
                <Route exact name=":rid" path=":rid">
                  <Redirect to="attributes" />
                  {/* /buckets/:bid/collections/:cid/records/:rid/attributes */}
                  <Route
                    exact
                    name="attributes"
                    path="attributes"
                    component={RecordAttributesPage}
                  />
                  {/* /buckets/:bid/collections/:cid/records/:rid/permissions */}
                  <Route
                    exact
                    name="permissions"
                    path="permissions"
                    component={RecordPermissionsPage}
                  />
                  {/* /buckets/:bid/collections/:cid/history */}
                  <Route
                    exact
                    name="history"
                    path="history"
                    component={RecordHistoryPage}
                  />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  );
}
