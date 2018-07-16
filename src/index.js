/* @flow */
import type { Plugin } from "./types";

import React, { Component } from "react";
import { Provider } from "react-redux";
import { Switch } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import { createHashHistory } from "history";

import getRoutes from "./routes";
import configureStore from "./store/configureStore";
import * as sessionActions from "./actions/session";
import { loadSession } from "./store/localStore";
import { getServerByPriority } from "./utils";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";

type Props = {
  plugins: Plugin[],
  settings: Object,
};

const hashHistory = createHashHistory();

export default class KintoAdmin extends Component<Props> {
  store: Object;

  static defaultProps = {
    plugins: [],
  };

  constructor(props: Props) {
    super(props);

    const { plugins, settings } = props;
    this.store = configureStore(hashHistory, { settings }, plugins);
    const { history } = this.store.getState();

    // Restore saved session, if any
    const session = loadSession();
    if (session) {
      this.store.dispatch(sessionActions.setup(session.auth));
    } else {
      this.store.dispatch(
        sessionActions.getServerInfo({
          authType: "anonymous",
          server: getServerByPriority(settings.singleServer, history),
        })
      );
    }
  }

  render() {
    const { store } = this;
    const { plugins } = this.props;
    const registerPlugins = plugins.map(plugin => plugin.register(store));

    return (
      <Provider store={store}>
        <ConnectedRouter history={hashHistory}>
          <Switch>{getRoutes(this.store, registerPlugins)}</Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}
