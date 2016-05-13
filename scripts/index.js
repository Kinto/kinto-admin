import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { syncReduxAndRouter } from "redux-simple-router";
import createHashHistory from "history/lib/createHashHistory";

import routes from "./routes";
import configureStore from "./store/configureStore";
import * as ClientActions from "./actions/client";
import * as CollectionActions from "./actions/collection";
import { clearNotifications } from "./actions/notifications";

import "../css/styles.css";
import "bootstrap/dist/css/bootstrap.css";


const history = createHashHistory();
const store = configureStore();

syncReduxAndRouter(history, store);

function onRouteUpdate() {
  const {params} = this.state;
  const {bid, cid} = params;
  const {collection} = store.getState();

  // If bid/cid has changed, reset collection store and load coll properties
  if (bid !== collection.bucket || cid !== collection.name) {
    store.dispatch(CollectionActions.reset());
    if (bid && cid) {
      store.dispatch(ClientActions.loadCollectionProperties(bid, cid));
    }
  }

  // Clear current notification list on each route update
  store.dispatch(clearNotifications());
}

// XXX this was how we initially loaded the list of configured collection
// store.dispatch(loadCollections());

render((
  <Provider store={store}>
    <Router history={history} onUpdate={onRouteUpdate}>
      {routes}
    </Router>
  </Provider>
), document.getElementById("app"));
