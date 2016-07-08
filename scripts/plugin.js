/* @flow */

/**
 * Note: The plugin API is experimental and likely to change over time. Don't
 * use it if you bet on stability.
 */
import React from "react";
import { Route } from "react-router";
// import { ActionTypes } from "redux/lib/createStore";


// const {INIT: REDUX_INIT} = ActionTypes;

export function flattenPluginsRoutes(
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

export function flattenPluginsSagas(
  plugins: Object[],
  getState: Function
): Object[] {
  return plugins.reduce((acc, {sagas:sagaDefs = []}) => {
    // Create the saga watchers for this plugin, passing them the getState
    // function
    const sagas = sagaDefs.map(([fn, ...args]) => fn(...args, getState));
    return [...acc, ...sagas];
  }, []);
}

function extendReducer(standard: Function, plugin: Function): Function {
  return function extendedReducer(state, action) {
    const standardState = standard(state, action);
    return plugin(standardState, action);
  };
}

export function flattenPluginsReducers(
  plugins: Object[],
  standardReducers: Object
): Object {
  return plugins.reduce((acc, {reducers: pluginReducers}) => {
    const finalReducers = Object.keys(pluginReducers).reduce((acc, name) => {
      const pluginReducer = pluginReducers[name];
      const standardReducer = standardReducers[name];
      return {
        ...acc,
        [name]: standardReducers.hasOwnProperty(name) ?
          extendReducer(standardReducer, pluginReducer) :
          pluginReducer
      };
    }, {});
    return {...acc, ...finalReducers};
  }, {});
}

