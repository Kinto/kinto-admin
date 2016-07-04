/* @flow */

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";
import history from "./history";


export default function createRootReducer(plugins=[]) {
  // XXX merge plugin reducers with standard ones
  // XXX check for name conflicts?
  return combineReducers({
    routing: routerReducer,
    session,
    bucket,
    collection,
    record,
    notifications,
    history,
  });
}
