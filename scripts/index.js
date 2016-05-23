import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { syncReduxAndRouter, updatePath } from "redux-simple-router";
import createHashHistory from "history/lib/createHashHistory";

import getRoutes from "./routes";
import configureStore from "./store/configureStore";
import * as BucketActions from "./actions/bucket";
import * as CollectionActions from "./actions/collection";
import { notifyInfo } from "./actions/notifications";
import { clearNotifications } from "./actions/notifications";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";


const history = createHashHistory();
const store = configureStore();

syncReduxAndRouter(history, store);

function onRouteUpdate() {
  const {params, location} = this.state;
  const {bid, cid, rid} = params;
  const {session, collection} = store.getState();
  const {authenticated} = session;

  // Check for an authenticated session; if we're requesting anything other
  // than the homepage, redirect to the homepage.
  if (!authenticated && !params.token && location.pathname !== "/") {
    store.dispatch(updatePath(""));
    store.dispatch(notifyInfo("Authentication required.", {persistent: true}));
    return;
  }

  // If bid/cid has changed, reset collection store and load coll properties
  if (bid !== collection.bucket || cid !== collection.name) {
    store.dispatch(CollectionActions.resetCollection());
    if (bid && cid) {
      store.dispatch(BucketActions.loadCollection(bid, cid));
      // XXX this is overkill in many situations, we should detect if we're
      // in a collection list route.
      store.dispatch(CollectionActions.listRecords(bid, cid));
    }
  }

  // If a record id is part of the url, load it
  if (bid && cid && rid) {
    store.dispatch(CollectionActions.loadRecord(bid, cid, rid));
  }

  // Clear current notification list on each route update
  store.dispatch(clearNotifications());
}

render((
  <Provider store={store}>
    <Router history={history} onUpdate={onRouteUpdate}>
      {getRoutes(store)}
    </Router>
  </Provider>
), document.getElementById("app"));
