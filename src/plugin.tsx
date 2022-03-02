/**
 * Note: The plugin API is experimental and likely to change over time. Don't
 * use it if you bet on stability.
 */
import React from "react";
import { CreateRoute } from "./routes";

export function flattenPluginsRoutes(plugins: any[]) {
  return plugins.reduce((acc, { routes = [] }) => {
    const pluginRoutes = routes.map((route, key) => {
      const { component, title, ...props } = route;
      return (
        <CreateRoute
          exact
          key={key}
          title={title}
          {...props}
          component={component}
        />
      );
    });
    return [...acc, ...pluginRoutes];
  }, []);
}

function extendReducer(
  firstReducer: Function,
  secondReducer: Function
): Function {
  // Create a reducer that executes the first reducer and use its result to call
  // the second one
  return function extendedReducer(state, action) {
    const firstState = firstReducer(state, action);
    return secondReducer(firstState, action);
  };
}

function extendReducers(pluginReducers, standardReducers) {
  return Object.keys(pluginReducers).reduce((acc, name) => {
    const pluginReducer = pluginReducers[name];
    const standardReducer = standardReducers[name];
    // If the name of the plugin reducer is already registered, then extend the
    // existing reducer with the plugin one
    return {
      ...acc,
      [name]: Object.prototype.hasOwnProperty.call(standardReducers, name)
        ? extendReducer(standardReducer, pluginReducer)
        : pluginReducer,
    };
  }, {});
}

export function flattenPluginsReducers(
  pluginsReducers: Object[],
  standardReducers: Object
): Object {
  // standardReducers contain the kinto-admin core reducers; each plugin
  // will extend their reducers against these, so a plugin will never extend
  // another plugin reducer.
  return pluginsReducers.reduce(
    (acc, pluginReducers = {}) => ({
      ...acc,
      ...extendReducers(pluginReducers, standardReducers),
    }),
    {}
  );
}
