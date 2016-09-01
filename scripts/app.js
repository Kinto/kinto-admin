import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, hashHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import getRoutes from "./routes";
import configureStore from "./store/configureStore";
import * as routeActions from "./actions/route";

import { setupClient } from "./client";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";


const SESSION_KEY = "kinto-admin-session";

function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) {
      return {};
    }
    setupClient(session);
    return {session};
  } catch(err) {
    return {};
  }
}

export function saveSession(sessionState) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionState));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function createAdmin(plugins=[]) {
  const store = configureStore(loadSession(), plugins);

  const registerPlugins = plugins.map(plugin => plugin.register(store));

  syncHistoryWithStore(hashHistory, store);

  function onRouteUpdate() {
    const {params, location} = this.state;
    store.dispatch(routeActions.routeUpdated(params, location));
  }

  const component = (
    <Provider store={store}>
      <Router history={hashHistory} onUpdate={onRouteUpdate}>
        {getRoutes(store, registerPlugins)}
      </Router>
    </Provider>
  );

  return {store, component};
}

export default function renderAdmin(node, plugins=[]) {
  const {component} = createAdmin(plugins);
  render(component, node);
}
