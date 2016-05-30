import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import notifications from "./notifications";


const rootReducer = combineReducers({
  routing: routerReducer,
  session,
  bucket,
  collection,
  record,
  notifications,
});

export default rootReducer;
