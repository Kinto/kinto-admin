import "../css/styles.css";
import { Layout } from "@src/components/Layout";
import { store } from "@src/store/configureStore";
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router";

export const App = () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <Layout />
      </HashRouter>
    </Provider>
  );
};
