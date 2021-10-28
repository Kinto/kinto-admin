import type { Plugin } from "./types";

import React, { Component } from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

import getRoutes from "./routes";
import configureStore, { hashHistory } from "./store/configureStore";
import { sessionActions } from "./slices/session";
import { loadSession } from "./store/localStore";
import { getServerByPriority } from "./utils";

import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";
import { Store } from "redux";

type Props = {
  plugins: Plugin[];
  settings: any;
};

export default class KintoAdmin extends Component<Props> {
  store: Store;

  static defaultProps = {
    plugins: [],
  };

  constructor(props: Props) {
    super(props);

    const { plugins, settings } = props;
    this.store = configureStore({ settings }, plugins);
    const { servers } = this.store.getState();

    // Restore saved session, if any
    const session = loadSession();
    if (session && session.auth) {
      this.store.dispatch(sessionActions.setupSession(session.auth));
    } else {
      this.store.dispatch(
        sessionActions.getServerInfo({
          authType: "anonymous",
          server: getServerByPriority(settings.singleServer, servers),
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
          {getRoutes(this.store, registerPlugins)}
        </ConnectedRouter>
      </Provider>
    );
  }
}
