import * as React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";

import { hashHistory, store } from "./store/configureStore";
import "bootstrap/dist/css/bootstrap.css";
import "codemirror/lib/codemirror.css";
import "../css/styles.css";
import { Layout } from "./components/Layout";

export const App = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={hashHistory}>
        <Layout />
      </ConnectedRouter>
    </Provider>
  );
};
