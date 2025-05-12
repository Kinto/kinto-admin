import bucket from "./bucket";
import group from "./group";
import heartbeat from "./heartbeat";
import record from "./record";
import session from "./session";
import signoff from "./signoff";
import { combineReducers } from "@reduxjs/toolkit";

export default function createRootReducer() {
  return combineReducers({
    session,
    bucket,
    group,
    heartbeat,
    record,
    signoff,
  });
}
