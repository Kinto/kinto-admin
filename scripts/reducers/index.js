/* @flow */

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";
import history from "./history";


const standardReducers = {
  routing: routerReducer,
  session,
  bucket,
  collection,
  record,
  notifications,
  history,
};

// XXX: in the future, we should investigate a way to "hook" into existing
// standard reducers (eg. to add more switch cases within reducers).
function flattenPluginReducers(plugins) {
  return plugins.reduce((acc, plugin) => {
    const pluginReducers = plugin.reducers;
    const standardNodes = Object.keys(standardReducers);
    const conflicts = Object.keys(pluginReducers).filter(node => {
      return standardNodes.includes(node);
    });
    if (conflicts.length !== 0) {
      throw new Error(`Plugins cannot register reserved reducers: ${conflicts}`);
    }
    return {...acc, ...pluginReducers};
  }, {});
}

export default function createRootReducer(plugins: Object[] = []) {
  return combineReducers({
    ...standardReducers,
    ...flattenPluginReducers(plugins),
  });
}
