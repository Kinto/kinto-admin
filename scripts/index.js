import "babel/polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router";
import routes from "./routes";
import configureStore from "./store/configureStore";
const createHashHistory = require("history/lib/createHashHistory");
import { syncReduxAndRouter } from "redux-simple-router";
import * as CollectionActions from "./actions/collection";

import "../css/styles.css";
import "../css/generic-form.css";

const history = createHashHistory();
const store = configureStore();

syncReduxAndRouter(history, store);

function onRouteUpdate() {
  // This will transparently select and load a collection when the :name param
  // changes in the URL.
  const currentCollectionName = store.getState().collection.name;
  const newCollectionName = this.state.params.name;
  if (newCollectionName && currentCollectionName !== newCollectionName) {
    store.dispatch(CollectionActions.selectAndLoad(newCollectionName));
  }
}

render((
  <Provider store={store}>
    <Router history={history} onUpdate={onRouteUpdate}>
      {routes}
    </Router>
  </Provider>
), document.getElementById("app"));
