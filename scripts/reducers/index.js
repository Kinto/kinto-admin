import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";

import session from "./session";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";


const rootReducer = combineReducers({
  routing: routeReducer,
  session,
  collection,
  record,
  notifications,
});

export default rootReducer;
