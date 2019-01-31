/* @flow */

import type { HashHistory } from "history/createHashHistory";

import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import { flattenPluginsReducers } from "../plugin";
import session from "./session";
import bucket from "./bucket";
import collection from "./collection";
import record from "./record";
import group from "./group";
import notifications from "./notifications";
import history from "./history";
import settings from "./settings";

const standardReducers = {
  session,
  bucket,
  collection,
  group,
  record,
  notifications,
  history,
  settings,
};

export default function createRootReducer(
  history: HashHistory,
  pluginsReducers: Object[] = []
) {
  return combineReducers<*, *>({
    router: connectRouter(history),
    ...standardReducers,
    ...flattenPluginsReducers(pluginsReducers, standardReducers),
  });
}
