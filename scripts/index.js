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

const store = configureStore();

// Get rid of react-router query string parameter
// https://github.com/reactjs/react-router/issues/1967#issuecomment-214659714
syncHistoryWithStore(hashHistory, store);

function onRouteUpdate() {
  const {params, location} = this.state;
  const {session} = store.getState();
  const {authenticated} = session;

  store.dispatch(routeActions.routeUpdated(authenticated, params, location));
}

render((
  <Provider store={store}>
    <Router history={hashHistory} onUpdate={onRouteUpdate}>
      {getRoutes(store)}
    </Router>
  </Provider>
), document.getElementById("app"));
