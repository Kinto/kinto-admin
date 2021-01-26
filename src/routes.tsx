import * as React from "react";
import { Component, PureComponent } from "react";
import { Route, Switch } from "react-router-dom";
import type { RouteComponentProps } from "react-router-dom";
import { utils as formUtils } from "kinto-admin-form";
import { Breadcrumb } from "react-breadcrumbs";
import type { Dispatch } from "redux";
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
): React.ComponentType {
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
    return formUtils.mergeObjects(acc, hookObject, true);
  }, {});
  // Wrap the root component, augmenting its props with the plugin hooks for it.
  return class extends Component {
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

type ComponentWrapperProps = RouteComponentProps & {
  component: React.ComponentType;
  routeUpdated: typeof RouteActions.routeUpdated;
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
    const {
      component: Component,
      routeUpdated: _routeUpdated,
      ...props
    } = this.props;
    // Each component takes a different set of OwnProps, which leads
    // to two problems with just calling the component with the props
    // here.
    //
    // - OwnProps is an exact object, so we can't call a component
    //   with "extra" props. We get all of the ContextRouter props and
    //   there's no way to distinguish which of those is needed for
    //   the component, so we have to pass all of them. It's true that
    //   every OwnProps is essentially derived from the ContextRouter
    //   type, so we *could* conceptually always use that, but that
    //   means we don't get a clear understanding of which Route prop
    //   each component uses. Besides, even if we do that...
    //
    // - We also customize the `match` type to better reflect the
    //   params we expect to get from react-router based on the path.
    //   react-router just gives us a string map, which isn't super
    //   helpful. Collection components replace that with
    //   CollectionRouteMatch etc. to assert that there should always
    //   be e.g. a bid and a cid. Fixing the types here would require
    //   adding some extra logic to ensure that the match we get is
    //   what we expect (and if not.. throw?).
    //
    // But if we didn't wrap react-router, everything would be
    // fine. Why is that? Of course, it's because react-router is
    // written in JS and the typings in flow-typed aren't
    // exact. `Route` is specified to take a component of any type,
    // which gets unified with the OwnProps we actually take, even
    // though `Route` always passes the complete set of router
    // props. We can't reproduce this behavior in correctly-typed
    // code, so let's not even try.

    // $FlowFixMe: maybe wait until we get better types for react-router
    return <Component {...props} />;
  }
}

type RouteCreatorProps = React.ComponentProps<typeof Route> & {
  title: string;
  routeUpdated?: typeof RouteActions.routeUpdated;
};

const routeCreator = ({
  component: Component,
  render,
  routeUpdated,
  children,
  title,
  ...props
}: RouteCreatorProps) => {
  return (
    <Route
      {...props}
      render={routeProps => {
        // If the title of the route starts with a ":" it's a "match param", so resolve it.
        const resolvedTitle = title.startsWith(":")
          ? routeProps.match.params[title.slice(1)]
          : title;
        return (
          <Breadcrumb
            data={{
              title: resolvedTitle,
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

function mapDispatchToProps(
  dispatch: Dispatch
): { routeUpdated: typeof RouteActions.routeUpdated } {
  return bindActionCreators(
    { routeUpdated: RouteActions.routeUpdated },
    dispatch
  );
}

export const CreateRoute = connect(null, mapDispatchToProps)(routeCreator);

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
            sidebar={hookedSidebar}
            notifications={hookedNotifications}
            collectionRecords={hookedCollectionRecords}
            pluginsRoutes={pluginsRoutes}
          />
        )}
      />
    </Switch>
  );
}
