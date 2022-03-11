import type { History } from "history";

import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import group from "./group";
import notifications from "./notifications";
import servers from "./servers";
import settings from "./settings";
import signoff from "./signoff";

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    session,
    bucket,
    collection,
    group,
    record,
    notifications,
    servers,
    settings,
    signoff,
  });
}
