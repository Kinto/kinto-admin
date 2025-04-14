import bucket from "./bucket";
import collection from "./collection";
import heartbeat from "./heartbeat";
import session from "./session";
import signoff from "./signoff";
import { combineReducers } from "@reduxjs/toolkit";
import { Reducer } from "redux";
import { RouterState } from "redux-first-history";

export default function createRootReducer(routerReducer: Reducer<RouterState>) {
  return combineReducers({
    router: routerReducer,
    session,
    bucket,
    collection,
    heartbeat,
    signoff,
  });
}
