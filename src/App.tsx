import React, { Component } from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

import configureStore, { hashHistory } from "./store/configureStore";
import * as sessionActions from "./actions/session";
import { loadSession } from "./store/localStore";
import { getServerByPriority } from "./utils";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";
import { Store } from "redux";
import Layout from "./containers/Layout";

export default class App extends Component {
  store: Store;

  constructor(props) {
    super(props);
    this.store = configureStore();
    const { servers } = this.store.getState();

    // Restore saved session, if any
    const session = loadSession();
    if (session && session.auth) {
      this.store.dispatch(sessionActions.setupSession(session.auth));
    } else {
      this.store.dispatch(
        sessionActions.getServerInfo({
          authType: "anonymous",
          server: getServerByPriority(servers),
        })
      );
    }
  }

  render() {
    const { store } = this;
    return (
      <Provider store={store}>
        <ConnectedRouter history={hashHistory}>
          <Layout />
        </ConnectedRouter>
      </Provider>
    );
  }
}
