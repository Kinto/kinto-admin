/* @flow */
import type { Plugin } from "./types";

import React, { Component } from "react";
import { Provider } from "react-redux";
import { Router, hashHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";

import { DEFAULT_KINTO_SERVER } from "./constants";
import getRoutes from "./routes";
import configureStore from "./store/configureStore";
import * as routeActions from "./actions/route";
import * as sessionActions from "./actions/session";
import { loadSession } from "./store/localStore";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";

type Props = {
  plugins: Plugin[],
  settings: Object,
};

export default class KintoAdmin extends Component<Props> {
  store: Object;

  static defaultProps = {
    plugins: [],
  };

  constructor(props: Props) {
    super(props);

    const { plugins, settings } = props;
    this.store = configureStore({ settings }, plugins);
    syncHistoryWithStore(hashHistory, this.store);
    const { history } = this.store.getState();

    // Restore saved session, if any
    const session = loadSession();
    if (session) {
      this.store.dispatch(sessionActions.setup(session.auth));
    } else {
      this.store.dispatch(
        sessionActions.getServerInfo({
          authType: "anonymous",
          server:
            settings.singleServer ||
            (history && history[0]) ||
            DEFAULT_KINTO_SERVER,
        })
      );
    }
  }

  render() {
    const { store } = this;
    const { plugins } = this.props;
    const registerPlugins = plugins.map(plugin => plugin.register(store));

    function onRouteUpdate() {
      const { params, location } = this.state;
      store.dispatch(routeActions.routeUpdated(params, location));
    }

    return (
      <Provider store={store}>
        <Router history={hashHistory} onUpdate={onRouteUpdate}>
          {getRoutes(this.store, registerPlugins)}
        </Router>
      </Provider>
    );
  }
}
