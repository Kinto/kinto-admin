/* @flow */

import type { GetStateFn, PluginSagas } from "./types";

/**
 * Note: The plugin API is experimental and likely to change over time. Don't
 * use it if you bet on stability.
 */
import React from "react";
import { Route } from "react-router";

export function flattenPluginsRoutes(
  plugins: Object[],
  defaultComponents: Object
): Object[] {
  return plugins.reduce(
    (acc, { routes = [] }) => {
      const pluginRoutes = routes.map((route, key) => {
        const { components, ...props } = route;
        return (
          <Route
            key={key}
            components={{ ...defaultComponents, ...components }}
            {...props}
          />
        );
      });
      return [...acc, ...pluginRoutes];
    },
    []
  );
}

export function flattenPluginsSagas(
  pluginsSagas: PluginSagas,
  getState: GetStateFn
): Object[] {
  return pluginsSagas.reduce(
    (acc, sagaDefs = []) => {
      // Create the saga watchers for this plugin, passing them the getState
      // function
      const pluginSagas = sagaDefs.map(([fn, ...args]) =>
        fn(...args, getState));
      return [...acc, ...pluginSagas];
    },
    []
  );
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
  return Object.keys(pluginReducers).reduce(
    (acc, name) => {
      const pluginReducer = pluginReducers[name];
      const standardReducer = standardReducers[name];
      // If the name of the plugin reducer is already registered, then extend the
      // existing reducer with the plugin one
      return {
        ...acc,
        [name]: standardReducers.hasOwnProperty(name)
          ? extendReducer(standardReducer, pluginReducer)
          : pluginReducer,
      };
    },
    {}
  );
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
