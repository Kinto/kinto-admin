import type { History } from "history";

import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import { flattenPluginsReducers } from "../plugin";
import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import group from "./group";
import notifications from "./notifications";
import servers from "./servers";
import settings from "./settings";

const standardReducers = {
  session,
  bucket,
  collection,
  group,
  record,
  notifications,
  servers,
  settings,
};

export default function createRootReducer(
  history: History,
  pluginsReducers: Object[] = []
) {
  return combineReducers({
    router: connectRouter(history),
    ...standardReducers,
    ...(flattenPluginsReducers(pluginsReducers, standardReducers) as any),
  });
}
