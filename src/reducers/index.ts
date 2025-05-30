import heartbeat from "./heartbeat";
import session from "./session";
import { combineReducers } from "@reduxjs/toolkit";

export default function createRootReducer() {
  return combineReducers({
    session,
    heartbeat,
  });
}
