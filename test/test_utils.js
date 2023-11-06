/* Utils for tests. */

import React from "react";
import sinon from "sinon";
import ReactDOM from "react-dom";
import { render } from "@testing-library/react";
import { Router } from "react-router";
import { Provider } from "react-redux";
import { configureAppStoreAndHistory } from "../src/store/configureStore";
import * as notificationsActions from "../src/actions/notifications";
import { createMemoryHistory } from "history";
import { Route } from "react-router-dom";

export function createComponent(
  ui,
  {
    initialState,
    route = "/",
    path = "/",
    initialHistory = createMemoryHistory({ initialEntries: [route] }),
  } = {}
) {
  const { store, history } = configureAppStoreAndHistory(
    initialState,
    initialHistory
  );
  const domContainer = document.createElement("div");
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route path={path}>{ui}</Route>
      </Router>
    </Provider>,
    domContainer
  );
  return domContainer.children.length == 0 ? null : domContainer;
}

export function createSandbox() {
  const sandbox = sinon.createSandbox();
  // Ensure we catch any React warning and mark them as test failures.
  sandbox.stub(console, "error").callsFake((...args) => {
    throw new Error(args);
  });
  return sandbox;
}

export function mockNotifyError(sandbox) {
  return sandbox
    .stub(notificationsActions, "notifyError")
    .callsFake((...args) => {
      return args;
    });
}

export function sessionFactory(props) {
  return {
    busy: false,
    authenticating: false,
    auth: {
      authType: "basicauth",
      server: "asdasd",
      credentials: {
        username: "user",
        password: "123",
      },
    },
    authenticated: true,
    permissions: [],
    buckets: [],
    serverInfo: {
      url: "",
      project_name: "foo",
      project_docs: "foo",
      capabilities: {},
      user: {
        id: "user1",
        principals: [`/buckets/main-workspace/groups/my-collection-reviewers`],
      },
    },
    ...props,
    redirectURL: "",
  };
}

export function renderWithProvider(
  ui,
  {
    initialState,
    route = "/",
    path = "/",
    initialHistory = createMemoryHistory({ initialEntries: [route] }),
  } = {}
) {
  const { store, history } = configureAppStoreAndHistory(
    initialState,
    initialHistory
  );
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <Router history={history}>
        <Route path={path}>{children}</Route>
      </Router>
    </Provider>
  );
  return {
    ...render(ui, { wrapper: Wrapper }),
    store,
    rerender: updatedComponent =>
      render(updatedComponent, { container: document.body, wrapper: Wrapper }),
  };
}
