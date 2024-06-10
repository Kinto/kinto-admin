import bucket from "./bucket";
import collection from "./collection";
import group from "./group";
import heartbeat from "./heartbeat";
import notifications from "./notifications";
import record from "./record";
import servers from "./servers";
import session from "./session";
import signoff from "./signoff";
import version from "./version";
import { combineReducers } from "@reduxjs/toolkit";
import { Reducer } from "redux";
import { RouterState } from "redux-first-history";

export default function createRootReducer(routerReducer: Reducer<RouterState>) {
  return combineReducers({
    router: routerReducer,
    session,
    bucket,
    collection,
    group,
    heartbeat,
    record,
    notifications,
    servers,
    signoff,
    version,
  });
}
