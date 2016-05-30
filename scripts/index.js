import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { syncHistoryWithStore, push as updatePath } from "react-router-redux";
import { hashHistory } from "react-router";
import getRoutes from "./routes";
import configureStore from "./store/configureStore";
import * as routeActions from "./actions/route";
import { notifyInfo } from "./actions/notifications";
import { clearNotifications } from "./actions/notifications";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";

const store = configureStore();

syncHistoryWithStore(hashHistory, store);

function onRouteUpdate() {
  const {params, location} = this.state;
  const {bid, cid, rid} = params;
  const {session} = store.getState();
  const {authenticated} = session;

  // Check for an authenticated session; if we're requesting anything other
  // than the homepage, redirect to the homepage.
  if (!authenticated && !params.token && location.pathname !== "/") {
    store.dispatch(updatePath(""));
    store.dispatch(notifyInfo("Authentication required.", {persistent: true}));
    return;
  }

  store.dispatch(routeActions.loadRoute(bid, cid, rid));

  // Clear current notification list on each route update
  store.dispatch(clearNotifications());
}

render((
  <Provider store={store}>
    <Router history={hashHistory} onUpdate={onRouteUpdate}>
      {getRoutes(store)}
    </Router>
  </Provider>
), document.getElementById("app"));
