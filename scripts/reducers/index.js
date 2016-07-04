/* @flow */

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";
import history from "./history";


export default function createRootReducer(plugins: Object[] = []) {
  // Merge plugin reducers with standard ones
  const pluginReducers = plugins.reduce((acc, plugin) => {
    // XXX check for name conflicts?
    return {...acc, ...plugin.reducers};
  }, {});
  return combineReducers({
    routing: routerReducer,
    session,
    bucket,
    collection,
    record,
    notifications,
    history,
    ...pluginReducers
  });
}
