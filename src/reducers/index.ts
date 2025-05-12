import heartbeat from "./heartbeat";
import session from "./session";
import signoff from "./signoff";
import { combineReducers } from "@reduxjs/toolkit";

export default function createRootReducer() {
  return combineReducers({
    session,
    heartbeat,
    signoff,
  });
}
