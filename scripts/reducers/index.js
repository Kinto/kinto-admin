/* @flow */

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";
import history from "./history";


const rootReducer = combineReducers({
  routing: routerReducer,
  session,
  bucket,
  collection,
  record,
  notifications,
  history,
});

export default rootReducer;
