import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";

import collection from "./collection";
import notifications from "./notifications";
import session from "./session";

const rootReducer = combineReducers({
  collection,
  notifications,
  session,
  routing: routeReducer,
});

export default rootReducer;
