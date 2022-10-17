import { Reducer } from "redux";
import { combineReducers } from "@reduxjs/toolkit";
import { RouterState } from "redux-first-history";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import group from "./group";
import notifications from "./notifications";
import servers from "./servers";
import signoff from "./signoff";

export default function createRootReducer(routerReducer: Reducer<RouterState>) {
  return combineReducers({
    router: routerReducer,
    session,
    bucket,
    collection,
    group,
    record,
    notifications,
    servers,
    signoff,
  });
}
