import * as React from "react";
import { Router } from "react-router";
import { Provider } from "react-redux";

import { store, history } from "./store/configureStore";
import "bootstrap/dist/css/bootstrap.css";
// import "codemirror/lib/codemirror.css";
import "../css/styles.css";
import { Layout } from "./components/Layout";

export const App = () => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Layout />
      </Router>
    </Provider>
  );
};
