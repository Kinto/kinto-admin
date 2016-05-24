import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import session from "./session";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";


const rootReducer = combineReducers({
  routing: routerReducer,
  session,
  collection,
  record,
  notifications,
});

export default rootReducer;
