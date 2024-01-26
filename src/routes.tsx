import * as RouteActions from "@src/actions/route";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import type { RouteComponentProps } from "react-router-dom";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

type ComponentWrapperProps = RouteComponentProps & {
  component: React.ComponentType;
  routeUpdated: typeof RouteActions.routeUpdated;
};

function ComponentWrapper(props: ComponentWrapperProps) {
  const { routeUpdated, match, location, component: Component } = props;

  const updateRoute = () => {
    routeUpdated(match.params, location);
  };

  useEffect(() => {
    updateRoute();
  }, [location]);

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

  // @ts-ignore
  return <Component {...props} />;
}

type RouteCreatorProps = React.ComponentProps<typeof Route> & {
  title: string;
  routeUpdated?: typeof RouteActions.routeUpdated;
};

function routeCreator({
  component: Component,
  render,
  routeUpdated,
  children,
  title,
  ...props
}: RouteCreatorProps) {
  return (
    <Route
      {...props}
      render={routeProps => {
        return Component ? (
          <ComponentWrapper
            component={Component}
            routeUpdated={routeUpdated}
            {...routeProps}
          />
        ) : render ? (
          render(routeProps)
        ) : (
          children
        );
      }}
    />
  );
}

function mapDispatchToProps(dispatch: Dispatch): {
  routeUpdated: typeof RouteActions.routeUpdated;
} {
  return bindActionCreators(
    { routeUpdated: RouteActions.routeUpdated },
    dispatch
  );
}

export const CreateRoute = connect(null, mapDispatchToProps)(routeCreator);
