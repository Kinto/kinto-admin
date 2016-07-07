import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, hashHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import getRoutes from "./routes";
import configureStore from "./store/configureStore";
import * as routeActions from "./actions/route";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";


export function createAdmin(plugins=[]) {
  const store = configureStore({}, plugins);

  syncHistoryWithStore(hashHistory, store);

  function onRouteUpdate() {
    const {params, location} = this.state;
    store.dispatch(routeActions.routeUpdated(params, location));
  }

  const component = (
    <Provider store={store}>
      <Router history={hashHistory} onUpdate={onRouteUpdate}>
        {getRoutes(store, plugins)}
      </Router>
    </Provider>
  );

  return {store, component};
}

export default function renderAdmin(node, plugins=[]) {
  const {component} = createAdmin(plugins);
  render(component, node);
}
