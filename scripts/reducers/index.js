import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";

import settings from "./settings";
import collection from "./collection";
import collections from "./collections";
import notifications from "./notifications";
import conflicts from "./conflicts";
import form from "./form";
import serverInfo from "./serverInfo";

const rootReducer = combineReducers({
  settings,
  collection,
  collections,
  notifications,
  conflicts,
  form,
  serverInfo,
  routing: routeReducer,
});

export default rootReducer;
