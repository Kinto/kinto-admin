import "../css/styles.css";
import { Layout } from "./components/Layout";
import { history, store } from "./store/configureStore";
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { Provider } from "react-redux";
import { Router } from "react-router";

export const App = () => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Layout />
      </Router>
    </Provider>
  );
};
