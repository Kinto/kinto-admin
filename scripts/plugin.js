/* @flow */

/**
 * Note: The plugin API is experimental and likely to change over time. Don't
 * use it if you bet on stability.
 */
import React from "react";
import { Route } from "react-router";


export function flattenPluginRoutes(
  plugins: Object[],
  defaultComponents: Object
): Object[] {
  return plugins.reduce((routes, plugin) => {
    const pluginRoutes = plugin.routes.map((route, key) => {
      const {components, ...props} = route;
      return (
        <Route key={key}
               components={{...defaultComponents, ...components}}
               {...props} />
      );
    });
    return [...routes, ...pluginRoutes];
  }, []);
}

export function flattenPluginSagas(
  plugins: Object[],
  getState: Function
): Object[] {
  return plugins.reduce((acc, plugin) => {
    // Create the saga watchers for this plugin, passing them the getState
    // function
    const sagas = plugin.sagas.map(([fn, ...args]) => fn(...args, getState));
    return [...acc, ...sagas];
  }, []);
}

// XXX: in the future, we should investigate a way to "hook" into existing
// standard reducers (eg. to add more switch cases within reducers).
export function flattenPluginReducers(
  plugins: Object[],
  reserved: string[] = []
): Object {
  return plugins.reduce((acc, {reducers: pluginReducers}) => {
    const conflicts = Object.keys(pluginReducers).filter(node => {
      return reserved.includes(node);
    });
    if (conflicts.length !== 0) {
      throw new Error(`Plugins cannot register reserved reducers: ${conflicts}`);
    }
    return {...acc, ...pluginReducers};
  }, {});
}
