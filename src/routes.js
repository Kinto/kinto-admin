/* @flow */
import * as React from "react";
import { Component, PureComponent } from "react";
import { Route, Switch } from "react-router-dom";
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
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import CollectionRecordsPage from "./containers/collection/CollectionRecordsPage";

function registerPluginsComponentHooks(
  PageContainer,
  plugins
): React.ComponentType<*> {
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
  component: React.ComponentType<*>,
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
        // If the title of the route starts with a ":" it's a "match param", so resolve it.
        const title = props.title.startsWith(":")
          ? routeProps.match.params[props.title.slice(1)]
          : props.title;
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
  const hookedSidebar = registerPluginsComponentHooks(Sidebar, plugins);
  const hookedNotifications = registerPluginsComponentHooks(
    Notifications,
    plugins
  );
  const hookedCollectionRecords = registerPluginsComponentHooks(
    CollectionRecordsPage,
    plugins
  );
  const pluginsRoutes = flattenPluginsRoutes(plugins);
  return (
    <Switch>
      <Route
        path="/"
        render={props => (
          <App
            plugins={plugins}
            sidebar={hookedSidebar}
            notifications={hookedNotifications}
            collectionRecords={hookedCollectionRecords}
            pluginsRoutes={pluginsRoutes}
            {...props}
          />
        )}
      />
    </Switch>
  );
}
