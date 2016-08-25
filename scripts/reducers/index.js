/* @flow */

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import { flattenPluginsReducers } from "../plugin";
import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import group from "./group";
import notifications from "./notifications";
import history from "./history";


const standardReducers = {
  routing: routerReducer,
  session,
  bucket,
  collection,
  group,
  record,
  notifications,
  history,
};

export default function createRootReducer(pluginsReducers: Object[] = []) {
  return combineReducers({
    ...standardReducers,
    ...flattenPluginsReducers(pluginsReducers, standardReducers),
  });
}
